from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.dependencies import get_db
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.purchase.purchase_schema import ProductPurchasePriceResponse
from app.services.purchase.purchase_service import get_purchase_price

router = APIRouter(prefix="/purchase", tags=["Purchase"])


@router.post("/price", response_model=ProductPurchasePriceResponse)
async def purchase_price(
    payload: ProductIdentifierRequest = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Récupère le prix d'achat net (px_achat_eur) pour une liste de produits.
    """
    return await get_purchase_price(payload, db)
