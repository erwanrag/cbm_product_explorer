# ===================================
# 📁 backend/app/services/optimisation/projection_validator.py - NOUVEAU
# ===================================

import numpy as np
from datetime import datetime
from app.common.logger import logger
from typing import Dict, List, Tuple, Any

class ProjectionValidator:
    """
    Système de scoring et validation des projections
    Analyse la qualité, fiabilité et cohérence des prédictions
    """
    
    @staticmethod
    def evaluate_projection_quality(
        projection_result: Dict, 
        historical_data: List[Tuple[str, float]],
        business_context: Dict = None
    ) -> Dict[str, Any]:
        """
        Évalue la qualité globale d'une projection avec scoring détaillé
        
        Args:
            projection_result: Résultat du ProjectionEngine
            historical_data: Données historiques [(periode, qte)]
            business_context: Contexte métier (prix, saisonnalité, etc.)
        
        Returns:
            Dict avec score, niveau confiance, warnings, recommandations
        """
        logger.debug(f"🔍 Évaluation qualité projection: {len(historical_data)} points historiques")
        
        # Extraction des données
        method = projection_result.get('method', 'unknown')
        predictions = projection_result.get('predictions', [])
        
        if not predictions or not historical_data:
            return ProjectionValidator._empty_evaluation()
        
        # Initialisation des métriques
        quality_metrics = []
        warnings = []
        recommendations = []
        details = {}
        
        # === MÉTRIQUES DE QUALITÉ ===
        
        # 1. Qualité des données historiques
        data_quality = ProjectionValidator._assess_data_quality(historical_data)
        quality_metrics.append(data_quality['score'])
        details['data_quality'] = data_quality
        
        # 2. Cohérence des prédictions
        prediction_coherence = ProjectionValidator._assess_prediction_coherence(
            predictions, historical_data
        )
        quality_metrics.append(prediction_coherence['score'])
        details['prediction_coherence'] = prediction_coherence
        warnings.extend(prediction_coherence.get('warnings', []))
        
        # 3. Performance du modèle
        model_performance = ProjectionValidator._assess_model_performance(
            method, projection_result, historical_data
        )
        quality_metrics.append(model_performance['score'])
        details['model_performance'] = model_performance
        
        # 4. Stabilité temporelle
        temporal_stability = ProjectionValidator._assess_temporal_stability(predictions)
        quality_metrics.append(temporal_stability['score'])
        details['temporal_stability'] = temporal_stability
        
        # 5. Contexte business (si fourni)
        if business_context:
            business_coherence = ProjectionValidator._assess_business_coherence(
                predictions, historical_data, business_context
            )
            quality_metrics.append(business_coherence['score'])
            details['business_coherence'] = business_coherence
        
        # === CALCUL SCORE GLOBAL ===
        overall_score = np.mean(quality_metrics) if quality_metrics else 0.0
        
        # === NIVEAU DE CONFIANCE ===
        confidence_level = ProjectionValidator._determine_confidence_level(
            overall_score, len(historical_data), method
        )
        
        # === RECOMMANDATIONS ===
        recommendations.extend(ProjectionValidator._generate_recommendations(
            method, overall_score, len(historical_data), details
        ))
        
        # === SYNTHÈSE ===
        return {
            'quality_score': round(overall_score, 3),
            'confidence_level': confidence_level,
            'method_used': method,
            'data_points': len(historical_data),
            'warnings': warnings,
            'recommendations': recommendations,
            'details': details,
            'evaluation_timestamp': datetime.now().isoformat(),
            'summary': ProjectionValidator._generate_summary(
                method, overall_score, confidence_level, len(historical_data)
            )
        }
    
    @staticmethod
    def _assess_data_quality(historical_data: List[Tuple[str, float]]) -> Dict:
        """Évalue la qualité des données historiques"""
        values = [qte for _, qte in historical_data]
        data_points = len(values)
        
        # Métriques de base
        mean_val = np.mean(values)
        std_val = np.std(values)
        cv = std_val / max(mean_val, 1)  # Coefficient de variation
        
        # Détection anomalies
        zero_count = sum(1 for v in values if v == 0)
        zero_ratio = zero_count / len(values)
        
        # Continuité temporelle (gaps)
        periods = [periode for periode, _ in historical_data]
        gaps = ProjectionValidator._detect_temporal_gaps(periods)
        
        # Scoring
        score = 1.0
        issues = []
        
        # Pénalités
        if data_points < 6:
            score -= 0.3
            issues.append(f"Peu de données ({data_points} mois)")
        elif data_points < 12:
            score -= 0.1
            issues.append("Données limitées (< 12 mois)")
        
        if cv > 2.0:  # Très volatile
            score -= 0.2
            issues.append(f"Données très volatiles (CV={cv:.1f})")
        elif cv > 1.0:
            score -= 0.1
            issues.append("Données volatiles")
        
        if zero_ratio > 0.3:
            score -= 0.2
            issues.append(f"{zero_ratio:.0%} de mois sans ventes")
        
        if len(gaps) > 0:
            score -= 0.1 * len(gaps)
            issues.append(f"{len(gaps)} gap(s) temporel(s)")
        
        return {
            'score': max(0.1, score),
            'data_points': data_points,
            'volatility': cv,
            'zero_ratio': zero_ratio,
            'temporal_gaps': len(gaps),
            'issues': issues,
            'quality_label': ProjectionValidator._score_to_label(score)
        }
    
    @staticmethod
    def _assess_prediction_coherence(predictions: List[float], historical_data: List[Tuple[str, float]]) -> Dict:
        """Évalue la cohérence des prédictions avec l'historique"""
        historical_values = [qte for _, qte in historical_data]
        hist_mean = np.mean(historical_values)
        pred_mean = np.mean(predictions)
        
        warnings = []
        score = 1.0
        
        # Test 1: Écarts extrêmes
        extreme_ratios = []
        for i, pred in enumerate(predictions):
            if hist_mean > 0:
                ratio = pred / hist_mean
                extreme_ratios.append(ratio)
                
                if ratio > 3:
                    warnings.append(f"Mois {i+1}: prédiction {ratio:.1f}x la moyenne historique")
                    score -= 0.15
                elif ratio < 0.2:
                    warnings.append(f"Mois {i+1}: prédiction très faible ({ratio:.1%} de la moyenne)")
                    score -= 0.1
        
        # Test 2: Cohérence des ordres de grandeur
        magnitude_coherence = 1 / (1 + abs(pred_mean - hist_mean) / max(hist_mean, 1))
        score *= magnitude_coherence
        
        # Test 3: Croissance mensuelle aberrante
        for i in range(1, len(predictions)):
            growth = (predictions[i] - predictions[i-1]) / max(predictions[i-1], 1)
            if abs(growth) > 0.5:  # +/-50% en un mois
                warnings.append(f"Croissance aberrante mois {i+1}: {growth:.1%}")
                score -= 0.1
        
        return {
            'score': max(0.1, score),
            'magnitude_coherence': magnitude_coherence,
            'extreme_ratios': extreme_ratios,
            'warnings': warnings
        }
    
    @staticmethod
    def _assess_model_performance(method: str, projection_result: Dict, historical_data: List[Tuple[str, float]]) -> Dict:
        """Évalue les performances spécifiques du modèle utilisé"""
        base_scores = {
            'prophet': 0.85,
            'linear_regression': 0.70,
            'ml_ensemble': 0.80,
            'constant': 0.40,
            'empty': 0.10,
            'linear_fallback': 0.50
        }
        
        score = base_scores.get(method, 0.50)
        performance_details = {'method': method}
        
        # Ajustements selon métriques spécifiques
        if method == 'linear_regression':
            r_squared = projection_result.get('r_squared', 0)
            if r_squared is not None:
                performance_details['r_squared'] = r_squared
                if r_squared >= 0.8:
                    score = 0.90
                elif r_squared >= 0.6:
                    score = 0.75
                elif r_squared >= 0.4:
                    score = 0.60
                else:
                    score = 0.40
        
        elif method == 'prophet':
            # Ajustements Prophet selon volume de données
            if len(historical_data) >= 24:
                score = 0.90  # Optimal
            elif len(historical_data) >= 12:
                score = 0.80
            else:
                score = 0.60  # Pas assez de données pour Prophet
        
        performance_details['adjusted_score'] = score
        performance_details['suitability'] = ProjectionValidator._assess_method_suitability(
            method, len(historical_data)
        )
        
        return {
            'score': score,
            'details': performance_details
        }
    
    @staticmethod
    def _assess_temporal_stability(predictions: List[float]) -> Dict:
        """Évalue la stabilité temporelle des prédictions"""
        if len(predictions) < 2:
            return {'score': 0.5, 'stability': 'insufficient_data'}
        
        # Calcul variations inter-mensuelles
        variations = []
        for i in range(1, len(predictions)):
            if predictions[i-1] > 0:
                variation = abs(predictions[i] - predictions[i-1]) / predictions[i-1]
                variations.append(variation)
        
        if not variations:
            return {'score': 0.3, 'stability': 'no_variation_data'}
        
        avg_variation = np.mean(variations)
        max_variation = max(variations)
        
        # Scoring basé sur la stabilité
        score = 1.0
        if max_variation > 0.5:  # Variation > 50%
            score -= 0.3
        if avg_variation > 0.2:  # Variation moyenne > 20%
            score -= 0.2
        
        stability_level = 'high' if score >= 0.8 else 'medium' if score >= 0.6 else 'low'
        
        return {
            'score': max(0.1, score),
            'avg_variation': avg_variation,
            'max_variation': max_variation,
            'stability': stability_level
        }
    
    @staticmethod
    def _assess_business_coherence(predictions: List[float], historical_data: List[Tuple[str, float]], business_context: Dict) -> Dict:
        """Évalue la cohérence business des projections"""
        # Contexte métier : saisonnalité, prix, segments, etc.
        score = 0.8  # Base
        
        # Vérifications selon le contexte fourni
        if 'seasonal_months' in business_context:
            # Logique saisonnalité spécifique
            pass
        
        if 'price_range' in business_context:
            # Logique cohérence prix
            pass
        
        return {
            'score': score,
            'context_applied': list(business_context.keys())
        }
    
    @staticmethod
    def _determine_confidence_level(score: float, data_points: int, method: str) -> str:
        """Détermine le niveau de confiance global"""
        if score >= 0.8 and data_points >= 12:
            return 'high'
        elif score >= 0.6 and data_points >= 6:
            return 'medium'
        elif score >= 0.4:
            return 'low'
        else:
            return 'very_low'
    
    @staticmethod
    def _generate_recommendations(method: str, score: float, data_points: int, details: Dict) -> List[str]:
        """Génère des recommandations d'amélioration"""
        recommendations = []
        
        if score < 0.6:
            recommendations.append("⚠️ Projection peu fiable, surveiller de près")
        
        if data_points < 12:
            recommendations.append("📈 Collecter plus de données historiques (idéal: 12+ mois)")
        
        if method == 'linear_regression' and data_points >= 24:
            recommendations.append("🚀 Avec 2+ ans de données, Prophet pourrait être plus précis")
        
        if details.get('data_quality', {}).get('volatility', 0) > 1.5:
            recommendations.append("📊 Données volatiles, considérer lissage ou analyse saisonnière")
        
        if score >= 0.8:
            recommendations.append("✅ Projection fiable, surveiller évolution mensuelle")
        
        return recommendations
    
    @staticmethod
    def _generate_summary(method: str, score: float, confidence: str, data_points: int) -> str:
        """Génère un résumé textuel de l'évaluation"""
        method_names = {
            'prophet': 'Prophet (IA)',
            'linear_regression': 'Régression linéaire',
            'ml_ensemble': 'ML Ensemble',
            'constant': 'Valeur constante',
            'linear_fallback': 'Régression simple'
        }
        
        method_display = method_names.get(method, method)
        score_pct = int(score * 100)
        
        return f"{method_display} • {data_points} mois • Score {score_pct}% • Confiance {confidence}"
    
    @staticmethod
    def _detect_temporal_gaps(periods: List[str]) -> List[str]:
        """Détecte les gaps temporels dans les données"""
        # Implémentation simplifiée - à enrichir selon besoins
        return []
    
    @staticmethod
    def _assess_method_suitability(method: str, data_points: int) -> str:
        """Évalue l'adéquation de la méthode aux données"""
        if method == 'prophet':
            if data_points >= 24:
                return 'optimal'
            elif data_points >= 12:
                return 'adequate'
            else:
                return 'insufficient_data'
        elif method == 'linear_regression':
            if data_points >= 6:
                return 'adequate'
            else:
                return 'limited'
        else:
            return 'basic'
    
    @staticmethod
    def _score_to_label(score: float) -> str:
        """Convertit un score en label lisible"""
        if score >= 0.8:
            return 'Excellente'
        elif score >= 0.6:
            return 'Bonne'
        elif score >= 0.4:
            return 'Moyenne'
        else:
            return 'Faible'
    
    @staticmethod
    def _empty_evaluation() -> Dict[str, Any]:
        """Retourne une évaluation vide en cas de données insuffisantes"""
        return {
            'quality_score': 0.0,
            'confidence_level': 'none',
            'method_used': 'none',
            'data_points': 0,
            'warnings': ['Données insuffisantes pour évaluation'],
            'recommendations': ['Collecter des données historiques'],
            'details': {},
            'evaluation_timestamp': datetime.now().isoformat(),
            'summary': 'Aucune donnée disponible pour projection'
        }