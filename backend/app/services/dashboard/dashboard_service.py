from sqlalchemy.ext.asyncio import AsyncSession
from app.utils.identifier_utils import resolve_codpro_list
from app.services.products.detail_service import get_product_details
from app.services.sales.sales_service import get_sales_aggregate, get_sales_history
from app.services.stock.stock_service import get_stock_actuel
from app.services.purchase.purchase_service import get_purchase_price
from app.services.products.match_service import get_codpro_match_list

from app.schemas.dashboard.dashboard_schema import DashboardFilterRequest, DashboardFicheResponse
from app.schemas.products.match_schema import ProductMatchListResponse
from app.common.payload_utils import is_payload_empty

from app.common.logger import logger
from app.cache.cache_keys import (
    dashboard_products_key,
    dashboard_sales_key,
    dashboard_stock_key,
    dashboard_purchase_key,
    dashboard_matches_key,
)
from app.common.redis_client import redis_client
import json


async def get_dashboard_fiche(payload: DashboardFilterRequest, db: AsyncSession) -> DashboardFicheResponse:
    if is_payload_empty(payload):
        return DashboardFicheResponse(
            details=[],
            sales=[],
            history=[],
            stock=[],
            purchase=[],
            matches=[]
        )

    # ✅ Résolution cod_pro_list
    cod_pro_list = await resolve_codpro_list(payload, db)
    if not cod_pro_list:
        return DashboardFicheResponse(
            details=[], sales=[], history=[], stock=[], purchase=[], matches=[]
        )

    # ✅ Clés Redis
    key_details = dashboard_products_key(payload)
    key_sales = dashboard_sales_key(payload)
    key_stock = dashboard_stock_key(payload)
    key_purchase = dashboard_purchase_key(payload)
    key_matches = dashboard_matches_key(payload)

    # ✅ Initialisation
    details = None
    sales = None
    stock = None
    purchase = None
    matches = None

    # ✅ Lecture cache
    try:
        if cached := await redis_client.get(key_details):
            logger.debug(f"✅ Cache hit dashboard:products")
            details = json.loads(cached).get("products", [])

        if cached := await redis_client.get(key_sales):
            logger.debug(f"✅ Cache hit dashboard:sales")
            sales = json.loads(cached).get("items", [])

        if cached := await redis_client.get(key_stock):
            logger.debug(f"✅ Cache hit dashboard:stock")
            stock = json.loads(cached).get("items", [])

        if cached := await redis_client.get(key_purchase):
            logger.debug(f"✅ Cache hit dashboard:purchase")
            purchase = json.loads(cached).get("items", [])

        if cached := await redis_client.get(key_matches):
            logger.debug(f"✅ Cache hit dashboard:matches")
            matches = json.loads(cached).get("matches", [])

    except Exception:
        logger.exception("[Redis] fallback dashboard")

    # ✅ Chargement des blocs manquants
    if details is None:
        details_response = await get_product_details(payload, db)
        details = details_response.products
        try:
            await redis_client.set(
                key_details,
                json.dumps({"products": [d.model_dump() for d in details]}),
                ex=3600
            )
        except Exception:
            logger.exception("[Redis] set details")

    if sales is None:
        sales_response = await get_sales_aggregate(payload, db)
        sales = sales_response.items
        try:
            await redis_client.set(
                key_sales,
                json.dumps({"items": [s.model_dump() for s in sales]}),
                ex=3600
            )
        except Exception:
            logger.exception("[Redis] set sales")

    history = (await get_sales_history(payload, db)).items  # ⏳ Pas caché

    if stock is None:
        stock_response = await get_stock_actuel(payload, db)
        stock = stock_response.items
        try:
            await redis_client.set(
                key_stock,
                json.dumps({"items": [s.model_dump() for s in stock]}),
                ex=3600
            )
        except Exception:
            logger.exception("[Redis] set stock")

    if purchase is None:
        purchase_response = await get_purchase_price(payload, db)
        purchase = purchase_response.items
        try:
            await redis_client.set(
                key_purchase,
                json.dumps({"items": [p.model_dump() for p in purchase]}),
                ex=3600
            )
        except Exception:
            logger.exception("[Redis] set purchase")

    if matches is None:
        match_response = await get_codpro_match_list(payload, db)
        matches = match_response.matches if isinstance(match_response, ProductMatchListResponse) else []
        try:
            await redis_client.set(
                key_matches,
                json.dumps({"matches": [m.model_dump() for m in matches]}),
                ex=3600
            )
        except Exception:
            logger.exception("[Redis] set matches")

    return DashboardFicheResponse(
        details=details,
        sales=sales,
        history=history,
        stock=stock,
        purchase=purchase,
        matches=matches
    )
