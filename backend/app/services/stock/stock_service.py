from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.utils.identifier_utils import resolve_codpro_list
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.stock.stock_schema import (
    ProductStockResponse,
    ProductStockHistoryResponse
)
from app.common.date_service import get_last_n_months
from app.common.payload_utils import is_payload_empty
from app.common.logger import logger
from app.cache.cache_keys import stock_actuel_key, stock_history_key
from app.common.redis_client import redis_client
import json


async def get_stock_actuel(payload: ProductIdentifierRequest, db: AsyncSession) -> ProductStockResponse:
    if is_payload_empty(payload):
        return ProductStockResponse(items=[])

    cod_pro_list = await resolve_codpro_list(payload, db)
    if not cod_pro_list:
        return ProductStockResponse(items=[])

    redis_key = stock_actuel_key(payload)
    try:
        cached = await redis_client.get(redis_key)
        if cached:
            logger.debug(f"✅ Cache hit stock:actuel pour {redis_key}")
            return ProductStockResponse(**json.loads(cached))
    except Exception:
        logger.exception("[Redis] fallback stock:actuel")

    try:
        placeholders = ", ".join([f":p{i}" for i in range(len(cod_pro_list))])
        params = {f"p{i}": int(cod) for i, cod in enumerate(cod_pro_list)}

        query = f"""
            SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
            SELECT cod_pro, depot, stock, pmp_eur
            FROM CBM_DATA.stock.Fact_Stock_Actuel WITH (NOLOCK)
            INNER JOIN (
                SELECT [WarehouseNumber] 
                FROM CBM_DATA.import.companyStatus WITH (NOLOCK) 
                WHERE [AnalysisFlag] = 1
            ) AS cs ON cs.WarehouseNumber = depot
            WHERE cod_pro IN ({placeholders})
        """
        result = await db.execute(text(query), params)
        rows = result.fetchall()

        items = [
            {
                "cod_pro": int(r[0]),
                "depot": int(r[1]),
                "stock": float(r[2] or 0),
                "pmp": float(r[3]) if r[3] is not None else None,
            }
            for r in rows
        ]

        logger.debug(f"✅ Stock actuel récupéré: {len(items)} éléments")

        try:
            await redis_client.set(redis_key, json.dumps({"items": items}), ex=1800)
            logger.debug(f"✅ Cache set stock:actuel pour {redis_key}")
        except Exception:
            logger.exception("[Redis] set stock:actuel")

        return ProductStockResponse(items=items)

    except SQLAlchemyError as e:
        logger.error(f"❌ Erreur SQL get_stock_actuel pour cod_pro_list={cod_pro_list}: {e}")
        return ProductStockResponse(items=[])
    except Exception as e:
        logger.error(f"❌ Erreur inattendue get_stock_actuel pour cod_pro_list={cod_pro_list}: {e}")
        return ProductStockResponse(items=[])


async def get_stock_history(
    payload: ProductIdentifierRequest,
    db: AsyncSession,
    last_n_months: int = None
) -> ProductStockHistoryResponse:
    if is_payload_empty(payload):
        return ProductStockHistoryResponse(items=[])

    cod_pro_list = await resolve_codpro_list(payload, db)
    if not cod_pro_list:
        return ProductStockHistoryResponse(items=[])

    months = get_last_n_months(last_n_months or 12)
    first_month = months[0] + "-01"

    redis_key = stock_history_key(cod_pro_list, first_month)
    try:
        cached = await redis_client.get(redis_key)
        if cached:
            logger.debug(f"✅ Cache hit stock:history pour {redis_key}")
            return ProductStockHistoryResponse(**json.loads(cached))
    except Exception:
        logger.exception("[Redis] fallback stock:history")

    try:
        placeholders = ", ".join([f":p{i}" for i in range(len(cod_pro_list))])
        params = {f"p{i}": int(cod) for i, cod in enumerate(cod_pro_list)}
        params["first_month"] = first_month

        query = f"""
            SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
            SELECT depot, cod_pro, dat_deb, dat_fin, stock, pmp
            FROM CBM_DATA.stock.Historique WITH (NOLOCK)
            INNER JOIN (
                SELECT [WarehouseNumber] 
                FROM CBM_DATA.import.companyStatus WITH (NOLOCK) 
                WHERE [AnalysisFlag] = 1
            ) AS cs ON cs.WarehouseNumber = depot
            WHERE cod_pro IN ({placeholders}) AND dat_deb >= :first_month
            ORDER BY cod_pro, depot, dat_deb
        """
        result = await db.execute(text(query), params)
        rows = result.fetchall()

        items = [
            {
                "depot": int(r[0]),
                "cod_pro": int(r[1]),
                "dat_deb": r[2].strftime("%Y-%m-%d") if r[2] else None,
                "dat_fin": r[3].strftime("%Y-%m-%d") if r[3] else None,
                "stock": float(r[4] or 0),
                "pmp": float(r[5]) if r[5] is not None else None,
            }
            for r in rows
        ]

        logger.debug(f"✅ Historique stock récupéré: {len(items)} éléments (>= {first_month})")

        try:
            await redis_client.set(redis_key, json.dumps({"items": items}), ex=1800)
            logger.debug(f"✅ Cache set stock:history pour {redis_key}")
        except Exception:
            logger.exception("[Redis] set stock:history")

        return ProductStockHistoryResponse(items=items)

    except SQLAlchemyError as e:
        logger.error(f"❌ Erreur SQL get_stock_history pour cod_pro_list={cod_pro_list}: {e}")
        return ProductStockHistoryResponse(items=[])
    except Exception as e:
        logger.error(f"❌ Erreur inattendue get_stock_history pour cod_pro_list={cod_pro_list}: {e}")
        return ProductStockHistoryResponse(items=[])
