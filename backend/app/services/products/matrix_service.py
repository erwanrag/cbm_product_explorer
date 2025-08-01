from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.common.redis_client import redis_client
from app.cache.cache_keys import resolve_codpro_key
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.services.identifiers.identifier_service import get_codpro_list_from_identifier
from app.schemas.products.matrix_schema import ProductMatrixResponse
from app.common.constants import REDIS_TTL_SHORT
from app.common.logger import logger
from app.common.payload_utils import is_payload_empty
import json


async def get_product_matrix_from_identifier(
    payload: ProductIdentifierRequest, db: AsyncSession
) -> ProductMatrixResponse:
    """
    Renvoie le groupe, la liste cod_pro, les ref_crn et ref_ext d'un produit/groupe.
    Version sécurisée sans injection SQL.
    """
    if is_payload_empty(payload):
        return ProductMatrixResponse(
            groupe_crn=None, cod_pro_list=[], ref_crn_list=[], ref_ext_list=[]
        )

    # ✅ 1. Cache Redis
    redis_key = resolve_codpro_key(payload.model_dump(exclude_none=True, sort_keys=True))
    try:
        cached = await redis_client.get(redis_key)
        if cached:
            logger.debug(f"✅ Cache hit matrix pour {redis_key}")
            return ProductMatrixResponse(**json.loads(cached))
    except Exception:
        logger.exception("[Redis] fallback get_product_matrix_from_identifier")

    # ✅ 2. Résolution de la vraie cod_pro_list
    cod_pro_list = payload.cod_pro_list or await get_codpro_list_from_identifier(payload, db)
    if hasattr(cod_pro_list, "cod_pro_list"):
        cod_pro_list = cod_pro_list.cod_pro_list

    if not cod_pro_list:
        empty_matrix = ProductMatrixResponse(
            groupe_crn=None, cod_pro_list=[], ref_crn_list=[], ref_ext_list=[]
        )
        return empty_matrix

    try:
        # ✅ 3. Paramètres SQL sécurisés
        placeholders = ", ".join([f":p{i}" for i in range(len(cod_pro_list))])
        params = {f"p{i}": int(cod) for i, cod in enumerate(cod_pro_list)}

        result = await db.execute(
            text(f"""
                SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
                SELECT DISTINCT 
                    pdp.grouping_crn AS groupe_crn, 
                    pdp.cod_pro, 
                    pdp.ref_crn, 
                    Dim_Produit.refext AS ref_ext
                FROM CBM_DATA.Pricing.Dimensions_Produit pdp WITH (NOLOCK)
                LEFT JOIN CBM_DATA.dm.Dim_Produit WITH (NOLOCK)
                    ON pdp.cod_pro = Dim_Produit.cod_pro
                WHERE pdp.cod_pro IN ({placeholders})
            """),
            params
        )
        rows = result.fetchall()

        # ✅ 4. Nettoyage et sets pour éviter les doublons
        cod_pro_set = sorted(set(int(row[1]) for row in rows if row[1]))
        ref_crn_set = sorted(set(row[2] for row in rows if row[2]))
        ref_ext_set = sorted(set(row[3] for row in rows if row[3]))
        groupe_crn_set = set(row[0] for row in rows if row[0])

        # ✅ 5. On renvoie un seul groupe_crn si unique
        groupe_crn = list(groupe_crn_set)[0] if len(groupe_crn_set) == 1 else None

        matrix = ProductMatrixResponse(
            groupe_crn=groupe_crn,
            cod_pro_list=cod_pro_set,
            ref_crn_list=ref_crn_set,
            ref_ext_list=ref_ext_set
        )

        # ✅ 6. Cache Redis
        try:
            await redis_client.set(redis_key, matrix.model_dump_json(), ex=REDIS_TTL_SHORT)
            logger.debug(f"✅ Matrix cached: {len(cod_pro_set)} cod_pro, {len(ref_crn_set)} ref_crn")
        except Exception:
            logger.exception("[Redis] set failed get_product_matrix_from_identifier")

        return matrix

    except SQLAlchemyError as e:
        logger.error(f"❌ Erreur SQL get_product_matrix pour cod_pro_list={cod_pro_list}: {e}")
        return ProductMatrixResponse(
            groupe_crn=None, cod_pro_list=[], ref_crn_list=[], ref_ext_list=[]
        )
    except Exception as e:
        logger.error(f"❌ Erreur inattendue get_product_matrix pour cod_pro_list={cod_pro_list}: {e}")
        return ProductMatrixResponse(
            groupe_crn=None, cod_pro_list=[], ref_crn_list=[], ref_ext_list=[]
        )