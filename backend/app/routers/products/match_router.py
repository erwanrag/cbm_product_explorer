from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.dependencies import get_db
from app.services.products.match_service import get_codpro_match_list
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.products.match_schema import ProductMatchListResponse

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("/match", response_model=ProductMatchListResponse)
async def product_match_route(
    payload: ProductIdentifierRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Retourne le matching cod_pro <-> ref_crn <-> ref_ext pour une liste de produits.
    """
    return await get_codpro_match_list(payload, db)
