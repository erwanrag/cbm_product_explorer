# backend/app/routers/matrix/matrix_view_router.py

from fastapi import APIRouter, Depends, Body, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
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


@router.get("/cell/{cod_pro}/{ref}", response_model=dict)
async def get_cell_detail(
    cod_pro: int,
    ref: str,
    db: AsyncSession = Depends(get_db)
):
    """
    ✅ Détails de correspondance pour une cellule spécifique
    Utile pour les tooltips ou drill-down depuis une cellule.
    """
    try:
        query = text("""
            SELECT 
                dp.cod_pro,
                dp.nom_pro,
                dp.qualite,
                dp.refint,
                bp.ref_crn,
                br.ref_ext
            FROM [CBM_DATA].[Pricing].[Grouping_crn_table] dp WITH (NOLOCK)
            LEFT JOIN [CBM_DATA].[DIM].[Bridge_cod_pro_ref_crn] bp WITH (NOLOCK) 
                ON dp.cod_pro = bp.cod_pro
            LEFT JOIN [CBM_DATA].[DIM].[Bridge_ref_crn_ref_ext] br WITH (NOLOCK)
                ON bp.ref_crn = br.ref_crn
            WHERE dp.cod_pro = :cod_pro
            AND (bp.ref_crn = :ref OR br.ref_ext = :ref OR dp.refint = :ref)
        """)
        
        result = await db.execute(query, {"cod_pro": cod_pro, "ref": ref})
        row = result.first()
        
        if not row:
            raise HTTPException(status_code=404, detail="Correspondance non trouvée")
        
        return {
            "cod_pro": row.cod_pro,
            "nom_pro": row.nom_pro,
            "qualite": row.qualite,
            "refint": row.refint,
            "ref_crn": row.ref_crn,
            "ref_ext": row.ref_ext,
            "match_type": "direct"
        }
    
    except Exception as e:
        logger.error(f"Erreur get_cell_detail: {e}")
        raise HTTPException(status_code=500, detail=str(e))