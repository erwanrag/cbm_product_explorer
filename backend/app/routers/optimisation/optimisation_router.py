from fastapi import APIRouter, Depends, Body, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db.dependencies import get_db
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.optimisation.optimisation_schema import GroupOptimizationListResponse
from app.services.optimisation.optimisation_service import evaluate_group_optimization
from typing import Optional
from app.common.logger import logger
from datetime import datetime

router = APIRouter(prefix="/optimisation", tags=["Optimisation"])

@router.post("/optimisation", response_model=GroupOptimizationListResponse)
async def matrix_optimization_route(
    payload: ProductIdentifierRequest,
    db: AsyncSession = Depends(get_db)
):
    return await evaluate_group_optimization(payload, db)

@router.get("/groups", response_model=GroupOptimizationListResponse)
async def get_optimisation_groups(
    grouping_crn: Optional[int] = Query(None, description="CRN spécifique"),
    db: AsyncSession = Depends(get_db)
):
    try:
        if grouping_crn:
            query = """
                SELECT DISTINCT cod_pro 
                FROM [CBM_DATA].[Pricing].[Grouping_crn_table] WITH (NOLOCK)
                WHERE grouping_crn = :grouping_crn
                  AND qualite IN ('OEM','PMQ','PMV')
            """
            result = await db.execute(text(query), {'grouping_crn': grouping_crn})
            cod_pro_list = [row[0] for row in result.fetchall()]
            if not cod_pro_list:
                return GroupOptimizationListResponse(items=[])

            payload = ProductIdentifierRequest(
                cod_pro_list=cod_pro_list,
                grouping_crn=grouping_crn,
                single_cod_pro=False
            )
        else:
            payload = ProductIdentifierRequest(single_cod_pro=False)

        return await evaluate_group_optimization(payload, db)
    except Exception as e:
        logger.error(f"💥 Erreur GET groups: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/debug/{grouping_crn}")
async def debug_projection_quality(
    grouping_crn: int,
    qualite: Optional[str] = Query(None, description="Qualité spécifique"),
    db: AsyncSession = Depends(get_db)
):
    try:
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
        result = await db.execute(text(query), {'grouping_crn': grouping_crn, 'qualite': qualite})
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
        logger.error(f"❌ Erreur debug: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def optimization_health_check():
    try:
        from app.services.optimisation.projection_service import ProjectionEngine, PROPHET_AVAILABLE, SKLEARN_AVAILABLE
        test_data = [("2024-01", 100), ("2024-02", 110), ("2024-03", 105), ("2024-04", 115)]
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
                'Sélection automatique', 'Contraintes de croissance',
                'Validation anti-aberrants', 'Fallback garanti'
            ]
        }
    except Exception as e:
        return {'status':'degraded','error':str(e),'fallback_available':True}


@router.post("/batch/run")
async def run_optimization_batch(
    db: AsyncSession = Depends(get_db)
):
    """
    🚀 LANCE LE BATCH D'OPTIMISATION COMPLET
    
    Calcule l'optimisation pour TOUS les groupes et sauvegarde dans la table Analytics.
    ⚠️ Attention : peut prendre plusieurs minutes selon le nombre de groupes
    """
    try:
        from app.services.optimisation.optimisation_batch_job import run_full_optimisation_batch
        
        logger.info("🎬 Lancement batch optimisation via API")
        
        # Lancement asynchrone du batch
        await run_full_optimisation_batch(db)
        
        return {
            "status": "success",
            "message": "Batch d'optimisation terminé avec succès",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Erreur batch optimisation: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'exécution du batch: {str(e)}"
        )


@router.get("/batch/status")
async def get_batch_status(
    db: AsyncSession = Depends(get_db)
):
    """
    📊 RÉCUPÈRE LE STATUT DU DERNIER BATCH
    
    Affiche les dernières données calculées dans la table Analytics
    """
    try:
        query = """
            SELECT 
                COUNT(*) as total_groupes,
                SUM(gain_total_18m) as gain_total,
                MAX(generated_at) as derniere_execution,
                AVG(amelioration_pct) as amelioration_moyenne
            FROM CBM_DATA.Analytics.Optimisation_Monitoring
        """
        
        result = await db.execute(text(query))
        row = result.fetchone()
        
        if not row or row[0] == 0:
            return {
                "status": "no_data",
                "message": "Aucune donnée - le batch n'a jamais été exécuté",
                "total_groupes": 0
            }
        
        return {
            "status": "ok",
            "total_groupes": row[0],
            "gain_total_18m": float(row[1] or 0),
            "derniere_execution": row[2].isoformat() if row[2] else None,
            "amelioration_moyenne_pct": round(float(row[3] or 0), 2),
            "message": "Données disponibles"
        }
        
    except Exception as e:
        logger.error(f"❌ Erreur status batch: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la récupération du statut: {str(e)}"
        )


@router.get("/batch/top-opportunities")
async def get_top_opportunities(
    limit: int = Query(20, ge=1, le=100, description="Nombre de résultats"),
    min_gain: float = Query(1000, ge=0, description="Gain minimum en €"),
    qualite: Optional[str] = Query(None, description="Filtrer par qualité (OEM/PMQ/PMV)"),
    db: AsyncSession = Depends(get_db)
):
    """
    🎯 TOP OPPORTUNITÉS D'OPTIMISATION
    
    Récupère les groupes avec les plus gros gains potentiels depuis la table Analytics
    """
    try:
        qualite_filter = "AND qualite = :qualite" if qualite else ""
        
        query = f"""
            SELECT TOP :limit
                grouping_crn,
                qualite,
                nb_refs,
                gain_total_18m,
                gain_manque_12m,
                gain_potentiel_6m,
                amelioration_pct,
                ca_12m,
                marge_actuelle_12m,
                generated_at
            FROM CBM_DATA.Analytics.Optimisation_Monitoring
            WHERE gain_total_18m >= :min_gain
              {qualite_filter}
            ORDER BY gain_total_18m DESC
        """
        
        params = {"limit": limit, "min_gain": min_gain}
        if qualite:
            params["qualite"] = qualite
        
        result = await db.execute(text(query), params)
        rows = result.fetchall()
        
        opportunities = []
        for row in rows:
            opportunities.append({
                "grouping_crn": row[0],
                "qualite": row[1],
                "nb_refs": row[2],
                "gain_total_18m": float(row[3]),
                "gain_manque_12m": float(row[4]),
                "gain_potentiel_6m": float(row[5]),
                "amelioration_pct": float(row[6]),
                "ca_12m": float(row[7]),
                "marge_actuelle_12m": float(row[8]),
                "generated_at": row[9].isoformat()
            })
        
        return {
            "total": len(opportunities),
            "opportunities": opportunities,
            "filters": {
                "limit": limit,
                "min_gain": min_gain,
                "qualite": qualite
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Erreur top opportunities: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la récupération des opportunités: {str(e)}"
        )