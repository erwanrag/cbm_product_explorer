from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.utils.identifier_utils import resolve_codpro_list
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.purchase.purchase_schema import ProductPurchasePriceResponse
from app.common.payload_utils import is_payload_empty
from app.common.logger import logger
from app.common.redis_client import redis_client
from app.cache.cache_keys import purchase_price_key
import json


async def get_purchase_price(payload: ProductIdentifierRequest, db: AsyncSession) -> ProductPurchasePriceResponse:
    """
    Récupère le prix d'achat net (px_achat_eur) pour une liste de cod_pro.
    Version sécurisée + cache Redis.
    """
    if is_payload_empty(payload):
        return ProductPurchasePriceResponse(items=[])

    cod_pro_list = await resolve_codpro_list(payload, db)
    if not cod_pro_list:
        return ProductPurchasePriceResponse(items=[])

    redis_key = purchase_price_key(payload)

    # ✅ 1. Tentative de lecture cache
    try:
        cached = await redis_client.get(redis_key)
        if cached:
            logger.debug(f"✅ Cache hit purchase_price pour {redis_key}")
            return ProductPurchasePriceResponse(**json.loads(cached))
    except Exception:
        logger.exception("[Redis] fallback get_purchase_price")

    try:
        # ✅ 2. Paramètres sécurisés
        placeholders = ", ".join([f":p{i}" for i in range(len(cod_pro_list))])
        params = {f"p{i}": int(cod) for i, cod in enumerate(cod_pro_list)}

        query = f"""
            SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
            SELECT cod_pro, px_net_eur as px_achat_eur
            FROM CBM_DATA.Pricing.Px_achat_net WITH (NOLOCK)
            WHERE cod_pro IN ({placeholders})
        """
        result = await db.execute(text(query), params)
        rows = result.fetchall()

        items = [
            {
                "cod_pro": int(r[0]),
                "px_achat_eur": float(r[1]) if r[1] is not None else None
            }
            for r in rows
        ]
        response = ProductPurchasePriceResponse(items=items)

        # ✅ 3. Écriture cache
        try:
            await redis_client.set(redis_key, json.dumps(response.model_dump()), ex=3600)
            logger.debug(f"✅ Cache enregistré purchase_price pour {redis_key}")
        except Exception:
            logger.exception("[Redis] set purchase_price")

        return response

    except SQLAlchemyError as e:
        logger.error(f"❌ Erreur SQL get_purchase_price pour cod_pro_list={cod_pro_list}: {e}")
        return ProductPurchasePriceResponse(items=[])
    except Exception as e:
        logger.error(f"❌ Erreur inattendue get_purchase_price pour cod_pro_list={cod_pro_list}: {e}")
        return ProductPurchasePriceResponse(items=[])
