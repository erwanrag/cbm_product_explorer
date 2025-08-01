from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.common.logger import logger
from app.common.redis_client import redis_client
from app.cache.cache_keys import match_codpro_key
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.products.match_schema import ProductMatchListResponse
from app.services.identifiers.identifier_service import get_codpro_list_from_identifier
from app.common.payload_utils import is_payload_empty
import json


async def get_codpro_match_list(payload: ProductIdentifierRequest, db: AsyncSession) -> ProductMatchListResponse:
    """
    Retourne le matching cod_pro <-> ref_crn <-> ref_ext pour toute une liste de cod_pro.
    Inclut le cache Redis.
    """
    if is_payload_empty(payload):
        return ProductMatchListResponse(matches=[])

    redis_key = match_codpro_key(payload)

    # ✅ 1. Cache Redis
    try:
        cached = await redis_client.get(redis_key)
        if cached:
            logger.debug(f"✅ Cache hit get_codpro_match_list pour {redis_key}")
            return ProductMatchListResponse(**json.loads(cached))
    except Exception:
        logger.exception("[Redis] fallback get_codpro_match_list")

    # ✅ 2. Résolution de la cod_pro_list
    cod_pro_list = payload.cod_pro_list or await get_codpro_list_from_identifier(payload, db)
    if hasattr(cod_pro_list, "cod_pro_list"):
        cod_pro_list = cod_pro_list.cod_pro_list

    if not cod_pro_list:
        return ProductMatchListResponse(matches=[])

    try:
        # ✅ 3. Paramètres SQL sécurisés
        placeholders = ", ".join([f":p{i}" for i in range(len(cod_pro_list))])
        params = {f"p{i}": int(cod) for i, cod in enumerate(cod_pro_list)}

        result = await db.execute(
            text(f"""
                SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
                SELECT DISTINCT
                    pdp.cod_pro, 
                    pdp.ref_crn, 
                    Dim_Produit.refext AS ref_ext
                FROM [CBM_DATA].[Pricing].[Grouping_crn_table] pdp WITH (NOLOCK)
                LEFT JOIN CBM_DATA.dm.Dim_Produit WITH (NOLOCK)
                    ON pdp.cod_pro = Dim_Produit.cod_pro
                WHERE pdp.cod_pro IN ({placeholders})
            """),
            params
        )

        rows = result.fetchall()
        seen = set()
        matches = []

        for row in rows:
            key = (int(row[0]), row[1], row[2])
            if key not in seen:
                matches.append({
                    "cod_pro": int(row[0]),
                    "ref_crn": row[1],
                    "ref_ext": row[2]
                })
                seen.add(key)

        logger.debug(f"✅ Matches récupérés: {len(matches)} éléments uniques")

        # ✅ 4. Cache Redis
        try:
            await redis_client.set(redis_key, json.dumps({"matches": matches}), ex=3600)
            logger.debug(f"✅ Cache set get_codpro_match_list pour {redis_key}")
        except Exception:
            logger.exception("[Redis] set get_codpro_match_list")

        return ProductMatchListResponse(matches=matches)

    except SQLAlchemyError as e:
        logger.error(f"❌ Erreur SQL get_codpro_match_list pour cod_pro_list={cod_pro_list}: {e}")
        return ProductMatchListResponse(matches=[])
    except Exception as e:
        logger.error(f"❌ Erreur inattendue get_codpro_match_list pour cod_pro_list={cod_pro_list}: {e}")
        return ProductMatchListResponse(matches=[])
