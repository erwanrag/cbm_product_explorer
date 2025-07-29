from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.dependencies import get_db
from app.schemas.matrice.matrice_schema import (
    MatriceFilterRequest,
    MatriceResponse,
)
from app.services.matrice.matrice_service import (
    get_matrice,
)

router = APIRouter(prefix="/matrice", tags=["Matrice"])

@router.post("/list", response_model=MatriceResponse)
async def matrice_list(
    payload: MatriceFilterRequest = Body(...),
    page: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=400),
    db: AsyncSession = Depends(get_db),
):
    return await get_matrice(payload, db, page, limit)
