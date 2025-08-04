# ===================================
# 📁 backend/app/services/optimisation/projection_monitoring.py
# ===================================

import numpy as np
from datetime import datetime
from app.common.logger import logger

class ProjectionMonitor:
    """Surveillance et validation des projections"""
    
    @staticmethod
    def evaluate_projection_quality(projections_result, historical_data):
        """
        Évalue la qualité d'une projection et génère des alertes
        
        Returns:
            dict: {
                'quality_score': float,  # 0-1
                'warnings': List[str],
                'recommendations': List[str],
                'confidence': str  # 'high', 'medium', 'low'
            }
        """
        warnings = []
        recommendations = []
        quality_metrics = []
        
        method = projections_result.get('method', 'unknown')
        predictions = projections_result.get('predictions', [])
        
        if not predictions or not historical_data:
            return {
                'quality_score': 0.0,
                'warnings': ['Données insuffisantes'],
                'recommendations': ['Collecter plus de données historiques'],
                'confidence': 'none'
            }
        
        # 1. Cohérence avec historique
        historical_values = [qte for _, qte in historical_data]
        hist_mean = np.mean(historical_values)
        hist_std = np.std(historical_values)
        
        # Vérification écarts extrêmes
        for i, pred in enumerate(predictions):
            if hist_mean > 0:
                ratio = pred / hist_mean
                if ratio > 5:
                    warnings.append(f"Mois {i+1}: prédiction {ratio:.1f}x la moyenne historique")
                elif ratio < 0.1:
                    warnings.append(f"Mois {i+1}: prédiction très faible ({ratio:.1%} de la moyenne)")
        
        # Score cohérence (0-1)
        pred_mean = np.mean(predictions)
        coherence_score = 1 / (1 + abs(pred_mean - hist_mean) / max(hist_mean, 1))
        quality_metrics.append(coherence_score)
        
        # 2. Stabilité des prédictions
        if len(predictions) > 1:
            pred_cv = np.std(predictions) / max(np.mean(predictions), 1)
            hist_cv = hist_std / max(hist_mean, 1)
            
            if pred_cv > hist_cv * 2:
                warnings.append("Projections plus volatiles que l'historique")
            
            stability_score = 1 / (1 + abs(pred_cv - hist_cv))
            quality_metrics.append(stability_score)
        
        # 3. Validation intervalles de confiance
        lower_bounds = projections_result.get('lower_bound', [])
        upper_bounds = projections_result.get('upper_bound', [])
        
        if lower_bounds and upper_bounds:
            # Vérifier largeur des intervalles
            intervals_width = [(u - l) / max(p, 1) for l, u, p in zip(lower_bounds, upper_bounds, predictions)]
            avg_interval_width = np.mean(intervals_width)
            
            if avg_interval_width < 0.05:  # < 5%
                warnings.append("Intervalles de confiance suspicieusement étroits")
                recommendations.append("Revoir les paramètres d'incertitude du modèle")
            elif avg_interval_width > 2.0:  # > 200%
                warnings.append("Intervalles de confiance très larges")
                recommendations.append("Améliorer la qualité des données ou changer de méthode")
            
            # Score intervalles
            interval_score = 1 - min(1, abs(avg_interval_width - 0.3) / 0.5)  # Optimal autour de 30%
            quality_metrics.append(interval_score)
        
        # 4. Évaluation selon la méthode
        method_scores = {
            'prophet': ProjectionMonitor._evaluate_prophet_specific(projections_result, historical_data),
            'linear_regression': ProjectionMonitor._evaluate_linear_specific(projections_result, historical_data),
            'ml_ensemble': ProjectionMonitor._evaluate_ml_specific(projections_result, historical_data),
            'constant': 0.3,  # Score fixe pour méthode basique
            'empty': 0.0
        }
        
        method_score = method_scores.get(method, 0.5)
        quality_metrics.append(method_score)
        
        # 5. Score global
        overall_quality = np.mean(quality_metrics) if quality_metrics else 0.0
        
        # 6. Niveau de confiance
        if overall_quality >= 0.8:
            confidence = 'high'
        elif overall_quality >= 0.6:
            confidence = 'medium'
        elif overall_quality >= 0.4:
            confidence = 'low'
        else:
            confidence = 'very_low'
        
        # 7. Recommandations générales
        if len(historical_data) < 12:
            recommendations.append("Collecter au moins 12 mois de données pour améliorer la précision")
        
        if method == 'linear_regression' and len(historical_data) >= 24:
            recommendations.append("Avec 2+ ans de données, considérer Prophet ou ML")
        
        if len(warnings) == 0:
            recommendations.append("Projections cohérentes, surveiller les résultats réels")
        
        return {
            'quality_score': round(overall_quality, 3),
            'warnings': warnings,
            'recommendations': recommendations,
            'confidence': confidence,
            'method_used': method,
            'data_points': len(historical_data),
            'evaluation_date': datetime.now().isoformat()
        }
    
    @staticmethod
    def _evaluate_prophet_specific(result, historical_data):
        """Évaluation spécifique à Prophet"""
        score = 0.8  # Base élevée car Prophet est sophistiqué
        
        # Vérifier composantes
        trend = result.get('trend_component', [])
        seasonal = result.get('seasonal_component', [])
        
        if trend and seasonal:
            # Vérifier cohérence composantes
            if max([abs(x) for x in seasonal]) > np.mean([abs(x) for x in trend]) * 2:
                score -= 0.2  # Saisonnalité trop dominante
        
        # Pénaliser si trop peu de données pour Prophet
        if len(historical_data) < 24:
            score -= 0.3
        
        return max(0.1, score)
    
    @staticmethod
    def _evaluate_linear_specific(result, historical_data):
        """Évaluation spécifique à la régression linéaire"""
        r_squared = result.get('r_squared', 0)
        
        if r_squared is None:
            return 0.5
        
        if r_squared >= 0.8:
            return 0.9
        elif r_squared >= 0.6:
            return 0.7
        elif r_squared >= 0.4:
            return 0.5
        else:
            return 0.3
    
    @staticmethod
    def _evaluate_ml_specific(result, historical_data):
        """Évaluation spécifique au ML ensemble"""
        consensus = result.get('model_consensus', 1)
        
        # Plus de modèles = plus de robustesse
        base_score = 0.7
        consensus_bonus = min(0.2, (consensus - 1) * 0.1)
        
        return base_score + consensus_bonus
    
    @staticmethod
    def generate_monitoring_report(all_projections_results):
        """
        Génère un rapport de monitoring pour un batch de projections
        
        Args:
            all_projections_results: List[dict] - Résultats de plusieurs projections
            
        Returns:
            dict: Rapport consolidé
        """
        if not all_projections_results:
            return {'error': 'Aucune projection à analyser'}
        
        methods_used = {}
        quality_scores = []
        total_warnings = 0
        
        for result in all_projections_results:
            evaluation = result.get('evaluation', {})
            method = evaluation.get('method_used', 'unknown')
            quality = evaluation.get('quality_score', 0)
            warnings_count = len(evaluation.get('warnings', []))
            
            methods_used[method] = methods_used.get(method, 0) + 1
            quality_scores.append(quality)
            total_warnings += warnings_count
        
        return {
            'total_projections': len(all_projections_results),
            'methods_distribution': methods_used,
            'average_quality': round(np.mean(quality_scores), 3) if quality_scores else 0,
            'quality_distribution': {
                'high': sum(1 for q in quality_scores if q >= 0.8),
                'medium': sum(1 for q in quality_scores if 0.6 <= q < 0.8),
                'low': sum(1 for q in quality_scores if 0.4 <= q < 0.6),
                'very_low': sum(1 for q in quality_scores if q < 0.4)
            },
            'total_warnings': total_warnings,
            'recommendations': [
                f"Méthode la plus utilisée: {max(methods_used.items(), key=lambda x: x[1])[0] if methods_used else 'Aucune'}",
                f"Qualité moyenne: {np.mean(quality_scores):.1%}" if quality_scores else "Pas de données qualité",
                f"{total_warnings} alertes générées au total"
            ],
            'generated_at': datetime.now().isoformat()
        }