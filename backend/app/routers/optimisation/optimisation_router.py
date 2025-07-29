# 📁 app/routers/matrix/matrix_router.py
from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.dependencies import get_db
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.optimisation.optimisation_schema import GroupOptimizationListResponse
from app.services.optimisation.optimisation_service import evaluate_group_optimization

router = APIRouter(prefix="/optimisation", tags=["Optimisation"])

@router.post("/optimisation", response_model=GroupOptimizationListResponse)
async def matrix_optimization_route(
    payload: ProductIdentifierRequest,  # ✅ Objet Pydantic direct
    db: AsyncSession = Depends(get_db)
):
    return await evaluate_group_optimization(payload, db)
