from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.common.redis_client import redis_client
from app.cache.cache_keys import resolve_codpro_key
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest, CodProListResponse
from app.common.constants import REDIS_TTL_SHORT
from app.common.logger import logger
import json


async def get_codpro_list_from_identifier(payload: ProductIdentifierRequest, db: AsyncSession) -> CodProListResponse:
    """
    Résout la liste des cod_pro à partir d’un identifiant produit (cod_pro, ref_crn, refint, ref_ext),
    en utilisant uniquement la table enrichie [Pricing].[Grouping_crn_table].
    Priorité :
    1. ref_crn → SELECT WHERE ref_crn
    2. refint / ref_ext / cod_pro → résolution cod_pro
       → puis grouping_crn si grouping_crn = 1
    3. fallback : cod_pro seul
    """

    redis_key = resolve_codpro_key(**payload.model_dump())
    try:
        cached = await redis_client.get(redis_key)
        if cached:
            logger.debug(f"✅ Cache hit pour {redis_key}")
            return CodProListResponse(**json.loads(cached))
    except Exception:
        logger.exception("[Redis] fallback cache")

    resolved: list[int] = []

    try:
        # 1️⃣ ref_crn → sélection directe
        if payload.ref_crn:
            logger.info(f"📌 Résolution via ref_crn={payload.ref_crn}, qualite={payload.qualite}")
            resolved = await _get_codpro_from_grouping_table(
                db,
                filter_column="ref_crn",
                filter_value=payload.ref_crn,
                qualite=payload.qualite
            )

        else:
            # 2️⃣ Résolution cod_pro via refint / ref_ext
            cod_pro = payload.cod_pro

            if not cod_pro and payload.refint:
                result = await db.execute(
                    text("SELECT TOP 1 cod_pro FROM CBM_DATA.Pricing.Grouping_crn_table WHERE refint = :refint"),
                    {"refint": payload.refint}
                )
                cod_pro = result.scalar()

            if not cod_pro and payload.ref_ext:
                result = await db.execute(
                    text("SELECT TOP 1 cod_pro FROM CBM_DATA.Pricing.Grouping_crn_table WHERE ref_ext = :ref_ext"),
                    {"ref_ext": payload.ref_ext}
                )
                cod_pro = result.scalar()

            if not cod_pro:
                logger.warning("❌ Aucun cod_pro trouvé à partir de refint/ref_ext/cod_pro")
                return CodProListResponse(cod_pro_list=[])

            # 3️⃣ grouping_crn = 1 → résolution élargie
            if payload.grouping_crn == 1:
                result = await db.execute(
                    text("SELECT TOP 1 grouping_crn FROM CBM_DATA.Pricing.Grouping_crn_table WHERE cod_pro = :cod_pro"),
                    {"cod_pro": cod_pro}
                )
                grouping_crn = result.scalar()

                if grouping_crn:
                    logger.info(f"📌 Résolution via grouping_crn={grouping_crn}, qualite={payload.qualite}")
                    resolved = await _get_codpro_from_grouping_table(
                        db,
                        filter_column="grouping_crn",
                        filter_value=grouping_crn,
                        qualite=payload.qualite
                    )
                else:
                    logger.warning(f"⚠️ Aucun grouping_crn trouvé pour cod_pro={cod_pro}")
                    resolved = [cod_pro]
            else:
                # 4️⃣ fallback : retour simple
                resolved = [cod_pro]

    except SQLAlchemyError as e:
        logger.error(f"❌ SQLAlchemyError résolution identifiant: {e}")
        resolved = []
    except Exception as e:
        logger.error(f"❌ Exception résolution identifiant: {e}")
        resolved = []

    try:
        await redis_client.set(redis_key, json.dumps({"cod_pro_list": resolved}), ex=REDIS_TTL_SHORT)
        logger.debug(f"✅ Cache enregistré pour {len(resolved)} cod_pro")
    except Exception:
        logger.exception("[Redis] set failed")

    return CodProListResponse(cod_pro_list=resolved)


async def _get_codpro_from_grouping_table(
    db: AsyncSession,
    filter_column: str,
    filter_value: str | int,
    qualite: str | None
) -> list[int]:
    """
    Interroge [Grouping_crn_table] par ref_crn ou grouping_crn avec filtre qualité.
    """
    if filter_column not in ("ref_crn", "grouping_crn"):
        logger.error(f"❌ Colonne de filtre invalide: {filter_column}")
        return []

    query = f"""
        SELECT DISTINCT cod_pro
        FROM CBM_DATA.Pricing.Grouping_crn_table
        WHERE {filter_column} = :filter_value
          AND (:qualite IS NULL OR qualite = :qualite)
    """

    try:
        result = await db.execute(text(query), {"filter_value": filter_value, "qualite": qualite})
        return [int(r[0]) for r in result.fetchall()]
    except Exception as e:
        logger.error(f"❌ Erreur lors de la lecture de Grouping_crn_table via {filter_column}={filter_value} : {e}")
        return []
