import numpy as np
from datetime import datetime
from app.common.logger import logger

class ProjectionMonitor:
    @staticmethod
    def evaluate_projection_quality(projections_result, historical_data):
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

        hist_vals = [q for _,q in historical_data]
        hist_mean = np.mean(hist_vals); hist_std = np.std(hist_vals)

        for i,p in enumerate(predictions):
            if hist_mean>0:
                ratio = p/hist_mean
                if ratio>5: warnings.append(f"Mois {i+1}: {ratio:.1f}x la moyenne historique")
                elif ratio<0.1: warnings.append(f"Mois {i+1}: très faible ({ratio:.1%} de la moyenne)")

        pred_mean = np.mean(predictions)
        coherence_score = 1/(1+abs(pred_mean - hist_mean)/max(hist_mean,1))
        if np.sum(predictions) > np.sum(hist_vals)*0.8:
            warnings.append("🚨 Projection totale > 80% du 12M")
        quality_metrics.append(coherence_score)

        if len(predictions)>1:
            pred_cv = np.std(predictions)/max(np.mean(predictions),1)
            hist_cv = hist_std/max(hist_mean,1)
            if pred_cv > hist_cv*2: warnings.append("Projections plus volatiles que l'historique")
            stability_score = 1/(1+abs(pred_cv-hist_cv))
            quality_metrics.append(stability_score)

        lo = projections_result.get('lower_bound', [])
        hi = projections_result.get('upper_bound', [])
        if lo and hi:
            widths = [(u-l)/max(p,1) for l,u,p in zip(lo,hi,predictions)]
            avg_w = np.mean(widths)
            if avg_w < 0.05:
                warnings.append("Intervalles trop étroits")
                recommendations.append("Augmenter l'incertitude du modèle")
            elif avg_w > 2.0:
                warnings.append("Intervalles très larges")
                recommendations.append("Améliorer la qualité des données / méthode")
            interval_score = 1 - min(1, abs(avg_w-0.3)/0.5)
            quality_metrics.append(interval_score)

        method_scores = {
            'prophet': ProjectionMonitor._evaluate_prophet_specific(projections_result, historical_data),
            'holt': ProjectionMonitor._evaluate_holt_specific(projections_result, historical_data),
            'linear_regression': ProjectionMonitor._evaluate_linear_specific(projections_result, historical_data),
            'ml_ensemble': ProjectionMonitor._evaluate_ml_specific(projections_result, historical_data),
            'constant': 0.3,
            'empty': 0.0
        }
        method_score = method_scores.get(method, 0.5)
        quality_metrics.append(method_score)

        overall = np.mean(quality_metrics) if quality_metrics else 0.0
        if overall>=0.8: conf='high'
        elif overall>=0.6: conf='medium'
        elif overall>=0.4: conf='low'
        else: conf='very_low'

        if len(historical_data)<12:
            recommendations.append("Collecter au moins 12 mois de données")
        if method=='linear_regression' and len(historical_data)>=24:
            recommendations.append("Considérer Prophet ou Holt")
        if len(warnings)==0:
            recommendations.append("Projections cohérentes, à surveiller")

        return {
            'quality_score': round(overall,3),
            'warnings': warnings,
            'recommendations': recommendations,
            'confidence': conf,
            'method_used': method,
            'data_points': len(historical_data),
            'evaluation_date': datetime.now().isoformat()
        }

    @staticmethod
    def _evaluate_prophet_specific(result, historical_data):
        score = 0.8
        if len(historical_data)<24: score -= 0.3
        return max(0.1, score)

    @staticmethod
    def _evaluate_holt_specific(result, historical_data):
        r2 = result.get('r_squared', 0) or 0
        if r2 >= 0.7: return 0.8
        if r2 >= 0.5: return 0.7
        if r2 >= 0.3: return 0.6
        return 0.45

    @staticmethod
    def _evaluate_linear_specific(result, historical_data):
        r2 = result.get('r_squared', 0) or 0
        if r2>=0.8: return 0.9
        if r2>=0.6: return 0.7
        if r2>=0.4: return 0.5
        return 0.3

    @staticmethod
    def _evaluate_ml_specific(result, historical_data):
        consensus = result.get('model_consensus', 1)
        return 0.7 + min(0.2, (consensus-1)*0.1)
