# backend/app/routers/matrix/matrix_view_router.py

from fastapi import APIRouter, Depends, Body, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.dependencies import get_db
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.matrix.matrix_view_schema import (
    MatrixViewResponse,
    MatrixViewFilterRequest
)
from app.services.matrix.matrix_view_service import (
    get_matrix_view_data,
    get_matrix_view_filtered
)
from app.common.logger import logger

router = APIRouter(prefix="/matrix", tags=["Matrix View"])


@router.post("/view", response_model=MatrixViewResponse)
async def get_matrix_view(
    payload: ProductIdentifierRequest = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Récupère les données complètes pour la vue matricielle.
    
    La vue matricielle présente :
    - **Lignes** : Produits avec leurs références internes et détails
    - **Colonnes** : Union des références CRN et EXT avec coloration par type
    - **Cellules** : Correspondances entre produits et références
    
    Args:
        payload: Critères d'identification des produits (cod_pro, ref_crn, refint, etc.)
        
    Returns:
        MatrixViewResponse: Structure complète pour affichage matriciel
        
    Example:
        ```json
        {
            "cod_pro": 15161
        }
        ```
        ou
        ```json
        {
            "ref_crn": "ATS52460"
        }
        ```
    """
    logger.info(f"🎯 Matrix view request: {payload}")
    return await get_matrix_view_data(payload, db)


@router.post("/view/filtered", response_model=MatrixViewResponse)
async def get_matrix_view_with_filters(
    payload: ProductIdentifierRequest = Body(...),
    filters: MatrixViewFilterRequest = Body(default_factory=MatrixViewFilterRequest),
    db: AsyncSession = Depends(get_db)
):
    """
    Vue matricielle avec filtres additionnels.
    
    Permet de filtrer les résultats par :
    - Qualité (OEM, PMQ, PMV, OE)
    - Famille produit
    - Statut (actif, interdit, etc.)
    - Terme de recherche dans ref_int ou désignation
    
    Args:
        payload: Critères de base pour identifier les produits
        filters: Filtres additionnels
        
    Returns:
        MatrixViewResponse: Vue matricielle filtrée
    """
    logger.info(f"🎯 Matrix view filtered request: {payload}, filters: {filters}")
    
    return await get_matrix_view_filtered(
        payload=payload,
        qualite_filter=filters.qualite,
        famille_filter=filters.famille,
        statut_filter=filters.statut,
        search_term=filters.search_term,
        db=db
    )


@router.get("/cell/{cod_pro}/{ref}")
async def get_matrix_cell_details(
    cod_pro: int,
    ref: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Détails d'une cellule spécifique de la matrice.
    
    Utile pour les tooltips ou drill-down depuis une cellule.
    
    Args:
        cod_pro: Code produit de la ligne
        ref: Référence de la colonne
        
    Returns:
        Détails de la correspondance pour cette cellule
    """
    # Pour l'instant, renvoie une structure simple
    # TODO: Implémenter si besoin de détails spécifiques par cellule
    return {
        "cod_pro": cod_pro,
        "ref": ref,
        "message": "Détails cellule à implémenter si nécessaire"
    }