from fastapi import APIRouter, Depends, Body, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.dependencies import get_db
from app.schemas.stock.stock_schema import ProductStockHistoryResponse, ProductStockResponse
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.services.stock.stock_service import get_stock_history, get_stock_actuel

router = APIRouter(prefix="/stock", tags=["Stock"])

@router.post("/current", response_model=ProductStockResponse)
async def stock_actuel(
    payload: ProductIdentifierRequest = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Récupère le stock actuel pour une ou plusieurs références.
    """
    return await get_stock_actuel(payload, db)

@router.post("/history", response_model=ProductStockHistoryResponse)
async def stock_history(
    payload: ProductIdentifierRequest = Body(...),
    last_n_months: int = Query(None, ge=1, le=36),
    db: AsyncSession = Depends(get_db),
):
    """
    Récupère l’historique du stock sur N mois max.
    """
    return await get_stock_history(payload, db, last_n_months)
