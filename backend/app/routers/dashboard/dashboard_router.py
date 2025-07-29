from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.dependencies import get_db
from app.schemas.dashboard.dashboard_schema import DashboardFicheResponse, DashboardFilterRequest
from app.services.dashboard.dashboard_service import get_dashboard_fiche

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.post("/fiche", response_model=DashboardFicheResponse)
async def dashboard_fiche(
    payload: DashboardFilterRequest = Body(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Retourne toutes les informations d’une fiche produit (détails, ventes, stock, achat).
    """
    return await get_dashboard_fiche(payload, db)
