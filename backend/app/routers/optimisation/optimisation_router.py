# ===================================
# 📁 backend/app/routers/optimisation/optimisation_router.py - OPTION 2 IMPLÉMENTÉE
# ===================================

from fastapi import APIRouter, Depends, Body, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db.dependencies import get_db
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.optimisation.optimisation_schema import GroupOptimizationListResponse
from app.services.optimisation.optimisation_service import evaluate_group_optimization
from typing import Optional
from app.common.logger import logger

router = APIRouter(prefix="/optimisation", tags=["Optimisation"])

@router.post("/optimisation", response_model=GroupOptimizationListResponse)
async def matrix_optimization_route(
    payload: ProductIdentifierRequest,  # ✅ Objet Pydantic direct
    db: AsyncSession = Depends(get_db)
):
    """
    ✅ ENDPOINT PRINCIPAL INCHANGÉ - garde votre format JSON existant
    
    Analyse les opportunités d'optimisation par rationalisation de gamme.
    Retourne les gains de marge potentiels en supprimant les références redondantes.
    
    **Format de réponse identique à l'existant :**
    - items[] avec grouping_crn, qualite, refs_total, etc.
    - historique_6m[] et projection_6m avec mois[] et totaux{}
    - refs_to_keep[], refs_to_delete_low_sales[], refs_to_delete_no_sales[]
    """
    return await evaluate_group_optimization(payload, db)


# ===================================
# 🔍 ENDPOINTS AMÉLIORÉS
# ===================================

@router.get("/groups", response_model=GroupOptimizationListResponse)
async def get_optimisation_groups(
    grouping_crn: Optional[int] = Query(None, description="CRN spécifique"),
    db: AsyncSession = Depends(get_db)
):
    """
    ✅ ENDPOINT GET AMÉLIORÉ - récupère automatiquement les cod_pro du groupe
    """
    try:
        if grouping_crn:
            # ✅ RÉCUPÉRATION AUTOMATIQUE DES COD_PRO DU GROUPE
            logger.info(f"🔍 Récupération cod_pro pour grouping_crn={grouping_crn}")
            
            query = """
                SELECT DISTINCT cod_pro 
                FROM [CBM_DATA].[Pricing].[Grouping_crn_table] WITH (NOLOCK)
                WHERE grouping_crn = :grouping_crn
                  AND qualite IN ('OEM','PMQ','PMV')
            """
            result = await db.execute(text(query), {'grouping_crn': grouping_crn})
            cod_pro_list = [row[0] for row in result.fetchall()]
            
            if not cod_pro_list:
                logger.warning(f"⚠️ Aucun cod_pro trouvé pour grouping_crn={grouping_crn}")
                return GroupOptimizationListResponse(items=[])
            
            logger.info(f"✅ {len(cod_pro_list)} cod_pro trouvés pour grouping_crn={grouping_crn}")
            
            # Construction payload avec cod_pro explicites
            payload = ProductIdentifierRequest(
                cod_pro_list=cod_pro_list,
                grouping_crn=grouping_crn,
                single_cod_pro=False
            )
        else:
            # Cas général : tous les groupes (attention, peut être lourd)
            payload = ProductIdentifierRequest(
                single_cod_pro=False
            )
        
        # Appel du service d'optimisation
        result = await evaluate_group_optimization(payload, db)
        
        logger.info(f"📊 Optimisation terminée: {len(result.items)} groupe(s) analysé(s)")
        return result
        
    except Exception as e:
        logger.error(f"💥 Erreur récupération optimisation GET: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la récupération des données d'optimisation: {str(e)}"
        )


@router.get("/debug/{grouping_crn}")
async def debug_projection_quality(
    grouping_crn: int,
    qualite: Optional[str] = Query(None, description="Qualité spécifique"),
    db: AsyncSession = Depends(get_db)
):
    """
    🔍 ENDPOINT DE DEBUG DIRECT EN BASE
    """
    try:
        # ✅ REQUÊTE DIRECTE pour ce groupe spécifique
        query = """
            SELECT dp.grouping_crn, dp.qualite, COUNT(*) as nb_refs,
                   SUM(ISNULL(s.ca_total,0)) as ca_total,
                   SUM(ISNULL(s.quantite_total,0)) as qte_total
            FROM (SELECT DISTINCT cod_pro, grouping_crn, qualite 
                  FROM [CBM_DATA].[Pricing].[Grouping_crn_table] WITH (NOLOCK)) dp
            LEFT JOIN (
                SELECT v.cod_pro, SUM(v.tot_vte_eur) AS ca_total, SUM(v.qte) AS quantite_total
                FROM CBM_DATA.Pricing.Px_vte_mouvement v WITH (NOLOCK)
                WHERE v.dat_mvt >= DATEADD(MONTH,-12,DATEADD(DAY, 1-DAY(CONVERT(DATE, GETDATE())), CONVERT(DATE, GETDATE())))
                AND v.dat_mvt < DATEADD(DAY, 1-DAY(CONVERT(DATE, GETDATE())), CONVERT(DATE, GETDATE()))
                GROUP BY v.cod_pro
            ) s ON dp.cod_pro = s.cod_pro
            WHERE dp.grouping_crn = :grouping_crn
              AND dp.qualite IN ('OEM','PMQ','PMV')
              AND (:qualite IS NULL OR dp.qualite = :qualite)
            GROUP BY dp.grouping_crn, dp.qualite
            ORDER BY dp.qualite
        """
        
        result = await db.execute(text(query), {
            'grouping_crn': grouping_crn,
            'qualite': qualite
        })
        rows = result.fetchall()
        
        if not rows:
            raise HTTPException(status_code=404, detail=f"Aucune donnée pour grouping_crn {grouping_crn}")
        
        debug_results = []
        for g, qual, nb_refs, ca, qte in rows:
            debug_results.append({
                'grouping_crn': g,
                'qualite': qual, 
                'nb_references': nb_refs,
                'ca_total_12m': float(ca or 0),
                'qte_total_12m': float(qte or 0),
                'has_sales': ca is not None and ca > 0,
                'note': 'Données trouvées directement en base (mois en cours exclu)'
            })
        
        return {
            'grouping_crn': grouping_crn,
            'debug_results': debug_results,
            'total_qualites': len(debug_results),
            'message': f'Groupe {grouping_crn} trouvé avec {len(debug_results)} qualité(s)'
        }
        
    except Exception as e:
        logger.error(f"❌ Erreur debug projection: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def optimization_health_check():
    """
    ✅ HEALTH CHECK
    Vérifie que tous les composants de projection fonctionnent
    """
    try:
        from app.services.optimisation.projection_service import ProjectionEngine, PROPHET_AVAILABLE, SKLEARN_AVAILABLE
        
        # Test simple du ProjectionEngine
        test_data = [
            ("2024-01", 100),
            ("2024-02", 110), 
            ("2024-03", 105),
            ("2024-04", 115)
        ]
        
        test_result = ProjectionEngine.project_sales(test_data, periods=3, method='auto')
        
        return {
            'status': 'healthy',
            'projection_engine': 'available',
            'prophet_available': PROPHET_AVAILABLE,
            'sklearn_available': SKLEARN_AVAILABLE,
            'test_projection': {
                'method_used': test_result['method'],
                'quality': test_result.get('model_quality', 'unknown'),
                'predictions_count': len(test_result['predictions']),
                'all_positive': all(p >= 0 for p in test_result['predictions'])
            },
            'improvements_active': [
                'Sélection automatique de méthode',
                'Contraintes de croissance',
                'Validation anti-aberrants',
                'Fallback garanti'
            ]
        }
        
    except Exception as e:
        logger.error(f"❌ Health check échoué: {e}")
        return {
            'status': 'degraded',
            'error': str(e),
            'fallback_available': True
        }