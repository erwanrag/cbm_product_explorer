from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.dependencies import get_db
from app.services.suggestion.suggestion_service import (
    get_refcrn_by_codpro,
    autocomplete_refint_or_codpro,
    autocomplete_ref_crn,
    autocomplete_ref_ext
)
from app.schemas.suggestion.suggestion_schema import (
    RefintCodproSuggestion,
    SuggestionResponse
)

router = APIRouter(prefix="/suggestions", tags=["Suggestions"])


@router.get("/refcrn", response_model=SuggestionResponse)
async def suggest_ref_crn(
    query: str = Query(..., min_length=1, description="Début de la référence constructeur (ref_crn)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Autocomplétion des références constructeur (`ref_crn`) à partir d’un préfixe saisi.
    """
    results = await autocomplete_ref_crn(query, db)
    return {"results": results}


@router.get("/ref_ext", response_model=SuggestionResponse)
async def suggest_ref_ext(
    query: str = Query(..., min_length=1, description="Début de la référence externe (ref_ext)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Autocomplétion des références externes (`ref_ext`) à partir d’un préfixe saisi.
    """
    results = await autocomplete_ref_ext(query, db)
    return {"results": results}


@router.get("/refint-codpro", response_model=list[RefintCodproSuggestion])
async def suggest_refint_or_codpro(
    query: str = Query(..., min_length=1, description="Début de la ref interne ou du code produit"),
    db: AsyncSession = Depends(get_db)
):
    """
    Suggestions de couples (`refint`, `cod_pro`) à partir d’un préfixe sur la ref interne ou le code produit.
    """
    return await autocomplete_refint_or_codpro(query, db)


@router.get("/refcrn_by_codpro", response_model=SuggestionResponse)
async def get_refcrn_codpro(
    cod_pro: int = Query(..., description="Code produit dont on veut les ref_crn associées"),
    db: AsyncSession = Depends(get_db)
):
    """
    Liste des `ref_crn` connues pour un `cod_pro` donné (multi-référencement possible).
    """
    results = await get_refcrn_by_codpro(cod_pro, db)
    return {"results": results}
