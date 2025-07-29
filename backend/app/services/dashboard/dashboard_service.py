from sqlalchemy.ext.asyncio import AsyncSession
from app.services.products.detail_service import get_product_details
from app.services.sales.sales_service import get_sales_aggregate, get_sales_history
from app.services.stock.stock_service import get_stock_actuel
from app.services.purchase.purchase_service import get_purchase_price
from app.services.products.match_service import get_codpro_match_list
from app.schemas.dashboard.dashboard_schema import DashboardFilterRequest, DashboardFicheResponse
from app.schemas.products.match_schema import ProductMatchListResponse
from app.common.payload_utils import is_payload_empty

import asyncio

async def get_dashboard_fiche(payload: DashboardFilterRequest, db) -> DashboardFicheResponse:
    if is_payload_empty(payload):
        return DashboardFicheResponse(
            details=[],
            sales=[],
            history=[],
            stock=[],
            purchase=[],
            matches=[]
        )
    """
    Rassemble toutes les informations nécessaires pour afficher la fiche produit (Dashboard).
    """
    details = (await get_product_details(payload, db)).products
    sales = (await get_sales_aggregate(payload, db)).items
    history = (await get_sales_history(payload, db)).items
    stock = (await get_stock_actuel(payload, db)).items
    purchase = (await get_purchase_price(payload, db)).items

    # ✅ Ajout du match ref_crn + ref_ext
    match = await get_codpro_match_list(payload, db)
    matches = match.matches if isinstance(match, ProductMatchListResponse) else []

    return DashboardFicheResponse(
        details=details,
        sales=sales,
        history=history,
        stock=stock,
        purchase=purchase,
        matches=matches  # ✅ nouveau champ
    )
