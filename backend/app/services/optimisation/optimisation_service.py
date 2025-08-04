# ===================================
# 📁 backend/app/services/optimisation/optimisation_service.py - COMPLET AVEC SCORING
# ===================================

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.services.identifiers.identifier_service import get_codpro_list_from_identifier
from app.schemas.optimisation.optimisation_schema import GroupOptimizationListResponse
from app.common.payload_utils import is_payload_empty
from app.common.logger import logger
from app.cache.cache_keys import optimisation_key
from app.common.redis_client import redis_client
import json

import numpy as np
from datetime import datetime
from dateutil.relativedelta import relativedelta
from time import perf_counter

# Import du ProjectionEngine amélioré
try:
    from app.services.optimisation.projection_service import ProjectionEngine
    PROJECTION_ENGINE_AVAILABLE = True
    logger.info("✅ ProjectionEngine importé avec succès")
except ImportError as e:
    PROJECTION_ENGINE_AVAILABLE = False
    logger.warning(f"⚠️ ProjectionEngine non disponible: {e}")
    
    # Créer une classe de fallback simple
    class ProjectionEngine:
        @staticmethod
        def project_sales(history_data, periods=6, method='auto'):
            """Fallback simple en cas d'import raté"""
            values = [float(qte) for _, qte in history_data] if history_data else []
            
            if not values:
                return {
                    'method': 'empty',
                    'predictions': [0] * periods,
                    'model_quality': 'none'
                }
            
            if len(values) == 1:
                return {
                    'method': 'constant',
                    'predictions': [values[0]] * periods,
                    'model_quality': 'basic'
                }
            
            # Régression linéaire simple avec numpy
            x = np.arange(len(values))
            try:
                slope, intercept = np.polyfit(x, values, 1)
            except:
                slope, intercept = 0, np.mean(values)
            
            # Projections futures
            future_x = np.arange(len(values), len(values) + periods)
            predictions = np.maximum(slope * future_x + intercept, 0)
            
            # Contrainte de croissance raisonnable
            for i in range(1, len(predictions)):
                if predictions[i] > predictions[i-1] * 1.5:
                    predictions[i] = predictions[i-1] * 1.2
            
            return {
                'method': 'linear_fallback',
                'predictions': predictions.tolist(),
                'slope': slope,
                'model_quality': 'basic'
            }

# ✅ NOUVEAU: Import du système de scoring
try:
    from app.services.optimisation.projection_validator import ProjectionValidator
    VALIDATOR_AVAILABLE = True
    logger.info("✅ ProjectionValidator importé avec succès")
except ImportError as e:
    VALIDATOR_AVAILABLE = False
    logger.warning(f"⚠️ ProjectionValidator non disponible: {e}")


async def evaluate_group_optimization(
    payload: ProductIdentifierRequest, db: AsyncSession
) -> GroupOptimizationListResponse:
    """
    ✅ FONCTION PRINCIPALE avec noms harmonisés + scoring
    Évalue les opportunités d'optimisation pour des groupes de produits
    """
    logger.info("Démarrage evaluate_group_optimization")

    if is_payload_empty(payload):
        logger.warning("Payload vide")
        return GroupOptimizationListResponse(items=[])

    # ✅ 1. RÉSOLUTION DES IDENTIFIANTS
    resolve_start = perf_counter()
    cod_pro_list = payload.cod_pro_list or await get_codpro_list_from_identifier(payload, db)
    if hasattr(cod_pro_list, "cod_pro_list"):
        cod_pro_list = cod_pro_list.cod_pro_list
    if not cod_pro_list:
        logger.warning("Aucun cod_pro trouvé après résolution")
        return GroupOptimizationListResponse(items=[])

    logger.info(f"cod_pro_list résolue: {len(cod_pro_list)} éléments en {perf_counter() - resolve_start:.2f}s")

    # ✅ 2. CACHE REDIS
    redis_key = optimisation_key(payload)
    try:
        cached = await redis_client.get(redis_key)
        if cached:
            logger.debug(f"✅ Cache hit optimisation pour {redis_key}")
            return GroupOptimizationListResponse(**json.loads(cached))
    except Exception:
        logger.exception("[Redis] fallback optimisation:group")

    try:
        # ✅ 3. REQUÊTE SQL PRINCIPALE
        logger.info("Lancement requête SQL principale avec CTE CodProList")
        sql_start = perf_counter()

        # Construction CTE dynamique pour performance
        cte_lines = [f"SELECT CAST(:p0 AS INT) AS cod_pro"]
        cte_lines += [f"UNION ALL SELECT CAST(:p{i} AS INT)" for i in range(1, len(cod_pro_list))]
        codpro_cte = "\n".join(cte_lines)
        params = {f"p{i}": int(cod) for i, cod in enumerate(cod_pro_list)}

        query = f"""
            WITH CodProList AS (
                {codpro_cte}
            ),
            Achat AS (
                SELECT a.cod_pro, MIN(a.px_net_eur) AS px_achat
                FROM CBM_DATA.Pricing.Px_achat_net a WITH (NOLOCK)
                JOIN CodProList c ON a.cod_pro = c.cod_pro
                GROUP BY a.cod_pro
            ),
            Sales AS (
                SELECT v.cod_pro, SUM(v.tot_vte_eur) AS ca_total, SUM(v.qte) AS quantite_total
                FROM CBM_DATA.Pricing.Px_vte_mouvement v WITH (NOLOCK)
                JOIN CodProList c ON v.cod_pro = c.cod_pro
                WHERE v.dat_mvt >= DATEADD(MONTH,-12,DATEADD(DAY, 1-DAY(CONVERT(DATE, GETDATE())), CONVERT(DATE, GETDATE())))
                AND v.dat_mvt < DATEADD(DAY, 1-DAY(CONVERT(DATE, GETDATE())), CONVERT(DATE, GETDATE()))
                GROUP BY v.cod_pro
            )
            SELECT dp.grouping_crn, dp.qualite, dp.cod_pro, dp.refint,
                   ISNULL(a.px_achat,0) AS px_achat,
                   ISNULL(s.ca_total,0) AS ca_total,
                   ISNULL(s.quantite_total,0) AS qte_total
            FROM (SELECT DISTINCT cod_pro, refint, grouping_crn, qualite FROM [CBM_DATA].[Pricing].[Grouping_crn_table] WITH (NOLOCK)) dp
            JOIN CodProList c ON dp.cod_pro = c.cod_pro
            LEFT JOIN Achat a ON dp.cod_pro = a.cod_pro
            LEFT JOIN Sales s ON dp.cod_pro = s.cod_pro
            WHERE dp.qualite IN ('OEM','PMQ','PMV')
            OPTION (RECOMPILE)
        """
        
        result = await db.execute(text(query), params)
        rows = result.fetchall()
        logger.info(f"SQL principale exécutée en {perf_counter() - sql_start:.2f}s, {len(rows)} lignes")

        # ✅ 4. AGRÉGATION PAR GROUPE/QUALITÉ
        groups = {}
        for g, qual, cod, refint, px, ca, qte in rows:
            if not g:
                continue
            
            key = (g, qual)
            groups.setdefault(key, {})
            groups[key][cod] = {
                "cod_pro": int(cod),
                "refint": refint,
                "px_achat": float(px or 0),
                "ca": float(ca or 0),
                "qte": float(qte or 0)
            }
        logger.info(f"{len(groups)} groupes trouvés après agrégation")

        # ✅ 5. RÉCUPÉRATION HISTORIQUE
        history = await _get_sales_history_for_trend(cod_pro_list, db)
        logger.info(f"Historique récupéré pour {len(history)} groupes")

        # ✅ 6. CALCULS D'OPTIMISATION AVEC SCORING
        items = []
        for (g, qual), prod_dict in groups.items():
            products = list(prod_dict.values())
            
            # Skip groupes avec trop peu de produits
            if len(products) <= 2:
                continue

            # Calculs économiques de base
            px_min = min([p["px_achat"] for p in products if p["px_achat"] > 0] or [0])
            qte_total = sum(p["qte"] for p in products)
            ca_total = sum(p["ca"] for p in products)
            px_vente_pondere = (ca_total / qte_total) if qte_total > 0 else 0
            pmp_pondere = (
                sum(p["px_achat"] * p["qte"] for p in products if p["qte"] > 0) / qte_total
                if qte_total > 0 else px_min
            )
            # Calcul gain de marge
            marge_actuelle = sum([p["ca"] - p["px_achat"] * p["qte"] for p in products])
            marge_simulee = px_vente_pondere * qte_total - px_min * qte_total
            gain_potentiel = marge_simulee - marge_actuelle

            # ✅ PROJECTIONS AVEC SCORING INTÉGRÉ
            historique_6m = _format_historique_6m(history, g, qual, px_vente_pondere, px_min)
            projection_6m = _project_next_6_months_with_scoring(
                history, g, qual, px_vente_pondere, px_min, pmp_pondere
            )

            # Sélection des références
            kept = sorted(products, key=lambda x: (-x["ca"] / max(x["px_achat"], 1)))[:2]
            kept_ids = {k["cod_pro"] for k in kept}
            refs_to_delete = [p for p in products if p["cod_pro"] not in kept_ids]
            
            # Séparation refs avec/sans ventes
            refs_low_sales = [p for p in refs_to_delete if p["ca"] > 0]
            refs_no_sales = [p for p in refs_to_delete if p["ca"] == 0]

            # Calcul gain par référence
            for r in refs_low_sales:
                r["gain_potentiel_par_ref"] = round((px_vente_pondere - px_min) * r["qte"], 2)
            for r in refs_no_sales:
                r["gain_potentiel_par_ref"] = 0

            # ✅ CONSTRUCTION ITEM - FORMAT JSON AVEC SCORING
            items.append({
                "grouping_crn": int(g),
                "qualite": qual,
                "refs_total": len(products),
                "px_achat_min": px_min,
                "px_vente_pondere": round(px_vente_pondere, 2),
                "taux_croissance": projection_6m["taux_croissance"],
                
                # ✅ NOMS HARMONISÉS AVEC LE FRONTEND
                "gain_potentiel": round(gain_potentiel, 2),                              # Gain immédiat
                "gain_potentiel_6m": round(projection_6m["totaux"]["marge_optimisee"], 2),       # Gain projeté 6M
                "marge_optimisee_6m": round(projection_6m["totaux"]["marge_optimisee"], 2),
                "marge_actuelle_6m": round(projection_6m["totaux"]["marge_actuelle"], 2),
                "historique_6m": historique_6m,
                "projection_6m": projection_6m,  # ✅ MAINTENANT AVEC MÉTADONNÉES DE SCORING
                "refs_to_keep": kept,
                "refs_to_delete_low_sales": refs_low_sales,
                "refs_to_delete_no_sales": refs_no_sales
            })

        # ✅ 7. MISE EN CACHE
        try:
            await redis_client.set(redis_key, json.dumps({"items": items}), ex=1800)
            logger.debug(f"✅ Cache set optimisation pour {redis_key}")
        except Exception:
            logger.exception("[Redis] set optimisation:group")

        logger.info(f"Optimisation calculée: {len(items)} groupes analysés")
        return GroupOptimizationListResponse(items=items)

    except SQLAlchemyError as e:
        logger.error(f"Erreur SQL evaluate_group_optimization pour cod_pro_list={cod_pro_list}: {e}")
        return GroupOptimizationListResponse(items=[])
    except Exception as e:
        logger.error(f"Erreur inattendue evaluate_group_optimization pour cod_pro_list={cod_pro_list}: {e}")
        return GroupOptimizationListResponse(items=[])


async def _get_sales_history_for_trend(cod_pro_list, db: AsyncSession):
    """✅ Récupère l'historique des ventes sur 12 mois, incluant les mois sans ventes"""
    try:
        placeholders = ", ".join([f":p{i}" for i in range(len(cod_pro_list))])
        params = {f"p{i}": int(cod) for i, cod in enumerate(cod_pro_list)}

        query = f"""
            SELECT dp.grouping_crn, dp.qualite,
                   CONVERT(VARCHAR(7), v.dat_mvt, 120) AS periode,
                   SUM(v.qte) AS qte
            FROM CBM_DATA.Pricing.Px_vte_mouvement v WITH (NOLOCK)
            INNER JOIN (SELECT DISTINCT cod_pro, grouping_crn, qualite FROM [CBM_DATA].[Pricing].[Grouping_crn_table] WITH (NOLOCK)) dp
            ON v.cod_pro = dp.cod_pro
            WHERE v.cod_pro IN ({placeholders})
              AND v.dat_mvt >= DATEADD(MONTH,-12,DATEADD(DAY, 1-DAY(CONVERT(DATE, GETDATE())), CONVERT(DATE, GETDATE())))
              AND v.dat_mvt < DATEADD(DAY, 1-DAY(CONVERT(DATE, GETDATE())), CONVERT(DATE, GETDATE()))
              AND dp.qualite IN ('OEM','PMQ','PMV')
            GROUP BY dp.grouping_crn, dp.qualite, CONVERT(VARCHAR(7), v.dat_mvt, 120)
            ORDER BY dp.grouping_crn, dp.qualite, periode
        """
        
        result = await db.execute(text(query), params)
        rows = result.fetchall()

        # Liste des 12 derniers mois (YYYY-MM)
        today = datetime.today()
        mois_ref = [
            (today.replace(day=1) - relativedelta(months=i + 1)).strftime("%Y-%m")
            for i in reversed(range(12))
        ]


        # Groupes détectés
        data = {}
        for g, qual, periode, qte in rows:
            key = (g, qual)
            data.setdefault(key, {})[periode] = float(qte or 0)

        # Complétion des mois manquants à zéro
        completed_data = {}
        for key, periode_qte_dict in data.items():
            completed_series = [(mois, periode_qte_dict.get(mois, 0.0)) for mois in mois_ref]
            completed_data[key] = completed_series

        logger.debug(f"✅ Historique completé: {len(completed_data)} groupes avec 12 mois chacun")
        return completed_data

    except SQLAlchemyError as e:
        logger.error(f"Erreur SQL _get_sales_history_for_trend: {e}")
        return {}
    except Exception as e:
        logger.error(f"Erreur inattendue _get_sales_history_for_trend: {e}")
        return {}


def _format_historique_6m(history, grouping_crn, qualite, px_vente_pondere, px_achat_min):
    """✅ FONCTION FORMATAGE HISTORIQUE"""
    key = (grouping_crn, qualite)
    series = history.get(key, [])
    series_sorted = sorted(series, key=lambda x: x[0])

    historique = []
    for periode, qte in series_sorted:
        qte = max(0, qte)  # ✅ Éliminer les retours négatifs
        ca = qte * px_vente_pondere
        marge = (px_vente_pondere - px_achat_min) * qte
        historique.append({
            "periode": periode,
            "qte": round(qte),
            "ca": round(ca, 2),
            "marge": round(marge, 2)
        })
    
    return historique


def _project_next_6_months_with_scoring(history, grouping_crn, qualite, px_vente_pondere, px_achat_min, pmp_pondere):

    """
    ✅ PROJECTION AVEC SCORING INTÉGRÉ - NOUVELLE FONCTION
    """
    key = (grouping_crn, qualite)
    series = history.get(key, [])
    
    if not series or all(qte <= 0 for _, qte in series):
        logger.warning(f"📉 Historique vide ou nul pour {grouping_crn}-{qualite} → projections nulles forcées")
        return {
            "taux_croissance": 0.0,
            "mois": [
                {
                    "periode": (datetime.today().replace(day=1) + relativedelta(months=i)).strftime("%Y-%m"),
                    "qte": 0,
                    "ca": 0,
                    "marge": 0
                }
                for i in range(6)
            ],
            "totaux": {"qte": 0, "ca": 0, "marge": 0},
            "metadata": {
                "method": "empty_forced",
                "quality_score": 0.0,
                "confidence_level": "none",
                "data_points": len(series),
                "summary": "Aucune vente significative",
                "warnings": ["Toutes les ventes sont nulles sur la période"],
                "recommendations": ["Vérifier les ventes sur 12 mois", "Supprimer si inactive"],
                "evaluation_timestamp": datetime.now().isoformat(),
                "validator_available": VALIDATOR_AVAILABLE
            }
        }

    
    # Validation des données d'entrée
    if len(series) > 50:
        logger.warning(f"⚠️ Série trop longue ({len(series)} mois) pour {grouping_crn}-{qualite}, troncature à 24 mois")
        series = series[-24:]
    
    logger.debug(f"🚀 Projection avec scoring {grouping_crn}-{qualite} avec {len(series)} mois")
    
    # ✅ UTILISATION DU PROJECTIONENGINE
    if PROJECTION_ENGINE_AVAILABLE:
        try:
            projection_result = ProjectionEngine.project_sales(series, periods=6, method='auto')
        except Exception as e:
            logger.error(f"❌ ProjectionEngine échoué: {e}, fallback simple")
            projection_result = _simple_linear_fallback(series, 6)
    else:
        logger.warning("⚠️ ProjectionEngine non disponible, fallback simple")
        projection_result = _simple_linear_fallback(series, 6)
    
    # ✅ ÉVALUATION QUALITÉ AVEC PROJECTIONVALIDATOR
    quality_evaluation = {}
    if VALIDATOR_AVAILABLE:
        try:
            # Contexte business pour améliorer l'évaluation
            business_context = {
                'price_range': {'min': px_achat_min, 'avg': px_vente_pondere},
                'quality_segment': qualite,
                'grouping_crn': grouping_crn
            }
            
            quality_evaluation = ProjectionValidator.evaluate_projection_quality(
                projection_result, 
                series, 
                business_context
            )
            
            logger.info(f"🔍 Scoring {grouping_crn}-{qualite}: {quality_evaluation.get('summary', 'N/A')}")
            
        except Exception as e:
            logger.error(f"❌ Erreur évaluation qualité: {e}")
            quality_evaluation = {
                'quality_score': 0.5,
                'confidence_level': 'unknown',
                'method_used': projection_result.get('method', 'unknown'),
                'data_points': len(series),
                'warnings': ['Erreur lors de l\'évaluation qualité'],
                'recommendations': ['Vérifier les paramètres de projection'],
                'summary': f"Méthode {projection_result.get('method', 'unknown')} utilisée"
            }
    else:
        # Fallback simple si ProjectionValidator indisponible
        quality_evaluation = {
            'quality_score': 0.6,  # Score par défaut
            'confidence_level': 'medium',
            'method_used': projection_result.get('method', 'unknown'),
            'data_points': len(series),
            'warnings': [],
            'recommendations': ['Activer ProjectionValidator pour scoring avancé'],
            'summary': f"Méthode {projection_result.get('method', 'unknown')} • {len(series)} mois"
        }
    
    # Conversion vers format CBM
    predictions = projection_result['predictions']
    method_used = projection_result['method']
    quality = projection_result.get('model_quality', 'unknown')
    
    # Construction des mois de projection
    projections = []
    total_qte = total_ca = total_marge_optimisee = total_marge_actuelle = 0
    current_month = datetime.today().replace(day=1)
    logger.debug(f"💡 Proj {grouping_crn}-{qualite} | predictions={predictions} | vente_pond={px_vente_pondere} | achat_min={px_achat_min}")
    for i, qte_pred in enumerate(predictions):
        qte_pred = max(0, round(qte_pred))  # Entier positif
        ca = qte_pred * px_vente_pondere
        marge_optimisee = (px_vente_pondere - px_achat_min) * qte_pred
        marge_actuelle  = (px_vente_pondere - pmp_pondere) * qte_pred
        
        periode = (current_month + relativedelta(months=i)).strftime("%Y-%m")
        projections.append({
            "periode": periode,
            "qte": qte_pred,
            "ca": round(ca, 2),
            "marge_optimisee": round(marge_optimisee, 2),
            "marge_actuelle": round(marge_actuelle, 2)
        })
        
        total_qte += qte_pred
        total_ca += ca
        total_marge_optimisee += marge_optimisee
        total_marge_actuelle += marge_actuelle
    
    # Calcul du taux de croissance
    if method_used == 'linear_regression' and 'slope' in projection_result:
        historical_avg = np.mean([qte for _, qte in series])
        taux_croissance = projection_result['slope'] / max(historical_avg, 1)
    else:
        if len(predictions) >= 2:
            trend_slope = (predictions[-1] - predictions[0]) / (len(predictions) - 1)
            pred_avg = np.mean(predictions) if predictions else 1
            taux_croissance = trend_slope / max(pred_avg, 1)
        else:
            taux_croissance = 0
    
    # Validation finale du taux de croissance
    taux_croissance = max(-0.5, min(0.5, taux_croissance))
    
    # ✅ CONSTRUCTION MÉTADONNÉES ENRICHIES
    metadata = {
        # Métriques techniques du modèle
        "method": method_used,
        "model_quality": quality,
        
        # Scoring et évaluation qualité
        "quality_score": quality_evaluation.get('quality_score', 0.5),
        "confidence_level": quality_evaluation.get('confidence_level', 'medium'),
        "data_points": len(series),
        
        # Détails spécifiques selon la méthode
        **{k: v for k, v in projection_result.items() 
           if k in ['r_squared', 'slope', 'confidence_interval', 'lower_bound', 'upper_bound']},
        
        # Alertes et recommandations
        "warnings": quality_evaluation.get('warnings', []),
        "recommendations": quality_evaluation.get('recommendations', []),
        
        # Résumé pour l'utilisateur
        "summary": quality_evaluation.get('summary', f"{method_used} • {len(series)} mois"),
        
        # Métadonnées d'évaluation
        "evaluation_timestamp": datetime.now().isoformat(),
        "validator_available": VALIDATOR_AVAILABLE
    }
    
    # Log de suivi enrichi
    logger.info(f"📈 Projection {grouping_crn}-{qualite}: {metadata['summary']} (Score: {metadata['quality_score']:.1%})")
    
    return {
        "taux_croissance": round(taux_croissance, 4),
        "mois": projections,
        "totaux": {
            "qte": int(total_qte),
            "ca": round(total_ca, 2),
            "marge_optimisee": round(total_marge_optimisee, 2),
            "marge_actuelle": round(total_marge_actuelle, 2)
        },
        "metadata": metadata  # ✅ MÉTADONNÉES ENRICHIES AVEC SCORING
    }


def _simple_linear_fallback(series, periods):
    """✅ Fallback simple en cas d'échec du ProjectionEngine"""
    values = [max(0, qte) for _, qte in series]  # ✅ Éliminer les négatifs
    
    if not values:
        return {
            'method': 'empty_fallback',
            'predictions': [0] * periods,
            'model_quality': 'none'
        }
    
    if len(values) == 1:
        return {
            'method': 'constant_fallback',
            'predictions': [values[0]] * periods,
            'model_quality': 'basic'
        }
    
    # Régression linéaire simple avec numpy
    x = np.arange(len(values))
    try:
        slope, intercept = np.polyfit(x, values, 1)
    except:
        slope, intercept = 0, np.mean(values)
    
    # Projections futures avec contraintes
    future_x = np.arange(len(values), len(values) + periods)
    predictions = np.maximum(slope * future_x + intercept, 0)
    
    # Contrainte de croissance raisonnable
    historical_avg = np.mean(values)
    for i in range(len(predictions)):
        if predictions[i] > historical_avg * 2:
            predictions[i] = historical_avg * 1.5
        elif predictions[i] < historical_avg * 0.1:
            predictions[i] = historical_avg * 0.3
    
    return {
        'method': 'linear_fallback',
        'predictions': predictions.tolist(),
        'slope': slope,
        'model_quality': 'basic'
    }