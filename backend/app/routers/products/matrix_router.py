from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.dependencies import get_db
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.products.matrix_schema import ProductMatrixResponse
from app.services.products.matrix_service import get_product_matrix_from_identifier

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("/matrix", response_model=ProductMatrixResponse)
async def product_matrix_route(
    payload: ProductIdentifierRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Renvoie le groupe, la liste cod_pro, les ref_crn et ref_ext d'un produit/groupe.
    """
    return await get_product_matrix_from_identifier(payload, db)
