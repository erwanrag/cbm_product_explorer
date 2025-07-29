from fastapi import APIRouter, Depends, Body, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.dependencies import get_db
from app.schemas.sales.sales_schema import (
    ProductSalesHistoryResponse,
    ProductSalesAggregateResponse
)
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.services.sales.sales_service import get_sales_history, get_sales_aggregate

router = APIRouter(prefix="/sales", tags=["Sales"])

@router.post("/history", response_model=ProductSalesHistoryResponse)
async def sales_history(
    payload: ProductIdentifierRequest = Body(...),
    last_n_months: int = Query(12, ge=1, le=36),
    db: AsyncSession = Depends(get_db)
):
    """
    Récupère l'historique des ventes (par mois) pour une ou plusieurs références.
    """
    return await get_sales_history(payload, db, last_n_months)

@router.post("/aggregate", response_model=ProductSalesAggregateResponse)
async def sales_aggregate(
    payload: ProductIdentifierRequest = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Récupère un agrégat global des ventes pour une ou plusieurs références.
    """
    return await get_sales_aggregate(payload, db)
