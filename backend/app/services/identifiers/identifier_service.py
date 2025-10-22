# =============================================
# 📁 app/services/identifiers/identifier_service.py
# ✅ VERSION CORRIGÉE ET OPTIMISÉE
# =============================================

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

    Priorité logique :
    1️⃣ ref_crn  → sélection directe ou groupée
    2️⃣ cod_pro  → via grouping_crn si demandé
    3️⃣ refint   → résolution cod_pro, puis même logique
    4️⃣ ref_ext  → résolution cod_pro, puis même logique
    5️⃣ sinon    → liste vide
    """

    payload_dict = payload.model_dump(exclude_none=False)
    redis_key = resolve_codpro_key(payload_dict)

    # --- Cache Redis ---
    try:
        cached = await redis_client.get(redis_key)
        if cached:
            logger.debug(f"✅ Cache hit pour {redis_key}")
            return CodProListResponse(**json.loads(cached))
    except Exception:
        logger.exception("[Redis] fallback cache")

    resolved: list[int] = []

    try:
        # ===============================================
        # 🔹 1️⃣ Si ref_crn présent → requête directe ou join groupée
        # ===============================================
        if payload.ref_crn:
            logger.info(f"📌 Résolution via ref_crn={payload.ref_crn}, qualite={payload.qualite}, grouping_crn={payload.grouping_crn}")

            if payload.grouping_crn == 1:
                query = """
                    SELECT DISTINCT t2.cod_pro
                    FROM CBM_DATA.Pricing.Grouping_crn_table AS t1
                    JOIN CBM_DATA.Pricing.Grouping_crn_table AS t2
                      ON t2.grouping_crn = t1.grouping_crn
                    WHERE t1.ref_crn = :ref_crn
                      AND (:qualite IS NULL OR t2.qualite = :qualite)
                """
            else:
                query = """
                    SELECT DISTINCT cod_pro
                    FROM CBM_DATA.Pricing.Grouping_crn_table
                    WHERE ref_crn = :ref_crn
                      AND (:qualite IS NULL OR qualite = :qualite)
                """

            result = await db.execute(text(query), {"ref_crn": payload.ref_crn, "qualite": payload.qualite})
            resolved = [int(r[0]) for r in result.fetchall()]

        else:
            # ===============================================
            # 🔹 2️⃣ Sinon → résolution via cod_pro / refint / ref_ext
            # ===============================================
            cod_pro = payload.cod_pro

            # 2a. Résolution cod_pro à partir de refint
            if not cod_pro and payload.refint:
                result = await db.execute(
                    text("""
                        SELECT TOP 1 cod_pro
                        FROM CBM_DATA.Pricing.Grouping_crn_table
                        WHERE refint = :refint
                    """),
                    {"refint": payload.refint},
                )
                cod_pro = result.scalar()

            # 2b. Résolution cod_pro à partir de ref_ext
            if not cod_pro and payload.ref_ext:
                result = await db.execute(
                    text("""
                        SELECT TOP 1 cod_pro
                        FROM CBM_DATA.Pricing.Grouping_crn_table
                        WHERE ref_ext = :ref_ext
                    """),
                    {"ref_ext": payload.ref_ext},
                )
                cod_pro = result.scalar()

            # 2c. Si aucun cod_pro trouvé → rien
            if not cod_pro:
                logger.warning("❌ Aucun cod_pro trouvé à partir de refint/ref_ext/cod_pro")
                return CodProListResponse(cod_pro_list=[])

            # ===============================================
            # 🔹 3️⃣ Si grouping_crn activé → chercher tout le groupe
            # ===============================================
            if payload.grouping_crn == 1:
                logger.info(f"📌 Résolution groupée via cod_pro={cod_pro}, qualite={payload.qualite}")

                query = """
                    SELECT DISTINCT t2.cod_pro
                    FROM CBM_DATA.Pricing.Grouping_crn_table AS t1
                    JOIN CBM_DATA.Pricing.Grouping_crn_table AS t2
                      ON t2.grouping_crn = t1.grouping_crn
                    WHERE t1.cod_pro = :cod_pro
                      AND (:qualite IS NULL OR t2.qualite = :qualite)
                """

                result = await db.execute(text(query), {"cod_pro": cod_pro, "qualite": payload.qualite})
                resolved = [int(r[0]) for r in result.fetchall()]

            else:
                # ===============================================
                # 🔹 4️⃣ Sinon → juste ce cod_pro
                # ===============================================
                resolved = [int(cod_pro)]

    except SQLAlchemyError as e:
        logger.error(f"❌ SQLAlchemyError résolution identifiant: {e}")
        resolved = []
    except Exception as e:
        logger.error(f"❌ Exception résolution identifiant: {e}")
        resolved = []

    # --- Cache Redis (résultat final) ---
    try:
        await redis_client.set(redis_key, json.dumps({"cod_pro_list": resolved}), ex=REDIS_TTL_SHORT)
        logger.debug(f"✅ Cache enregistré pour {len(resolved)} cod_pro ({redis_key})")
    except Exception:
        logger.exception("[Redis] set failed")

    return CodProListResponse(cod_pro_list=resolved)


# ======================================================================
# 🔧 Sous-fonction (fallback direct utilisée pour debug ou cas spéciaux)
# ======================================================================

async def _get_codpro_from_grouping_table(
    db: AsyncSession,
    filter_column: str,
    filter_value: str | int,
    qualite: str | None
) -> list[int]:
    """
    Interroge [Grouping_crn_table] par ref_crn ou grouping_crn avec filtre qualité.
    (Méthode conservée pour compatibilité et debug)
    """
    if filter_column not in ("ref_crn", "grouping_crn"):
        logger.error(f"❌ Colonne de filtre invalide: {filter_column}")
        return []

    try:
        if filter_column == "ref_crn":
            query = """
                SELECT DISTINCT cod_pro
                FROM CBM_DATA.Pricing.Grouping_crn_table
                WHERE ref_crn = :filter_value
                  AND (:qualite IS NULL OR qualite = :qualite)
            """
        else:
            query = """
                SELECT DISTINCT cod_pro
                FROM CBM_DATA.Pricing.Grouping_crn_table
                WHERE grouping_crn = :filter_value
                  AND (:qualite IS NULL OR qualite = :qualite)
            """

        result = await db.execute(text(query), {"filter_value": filter_value, "qualite": qualite})
        return [int(r[0]) for r in result.fetchall()]

    except Exception as e:
        logger.error(f"❌ Erreur lors de la lecture de Grouping_crn_table ({filter_column}={filter_value}) : {e}")
        return []
