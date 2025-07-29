# backend/app/routers/identifiers/identifier_router.py

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.dependencies import get_db
from app.services.identifiers.identifier_service import get_codpro_list_from_identifier
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest, CodProListResponse

router = APIRouter(prefix="/identifiers", tags=["Identifiers"])

@router.post("/resolve-codpro", response_model=CodProListResponse)
async def resolve_codpro_list_route(
    payload: ProductIdentifierRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Résout une ou plusieurs références produit (cod_pro_list) à partir d'un identifiant produit.
    """
    return await get_codpro_list_from_identifier(payload, db)
