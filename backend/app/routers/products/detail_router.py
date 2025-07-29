from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.dependencies import get_db
from app.services.products.detail_service import get_product_details
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.products.detail_schema import ProductDetailResponse

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("/details", response_model=ProductDetailResponse)
async def get_product_details_route(
    payload: ProductIdentifierRequest = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Récupère le détail d'une ou plusieurs références produits.
    """
    # ✅ CORRECTION: Pas de normalisation qui casse le grouping_crn
    # On passe directement le payload tel quel au service
    details = await get_product_details(payload, db)
    
    if not details.products:
        raise HTTPException(status_code=404, detail="Aucun produit trouvé")
    return details


@router.get("/detail/{cod_pro}", response_model=None)
async def get_single_product_detail(
    cod_pro: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Récupère le détail d'un produit unique par cod_pro.
    """
    # ✅ Pour ce endpoint GET, on crée un payload simple sans grouping
    payload = ProductIdentifierRequest(cod_pro_list=[cod_pro])
    details = await get_product_details(payload, db)
    return details.products[0] if details.products else None