# ===================================
# 📁 backend/app/services/optimisation/projection_service.py - COMPLET
# ===================================

import pandas as pd
import numpy as np
from datetime import datetime
from dateutil.relativedelta import relativedelta
from app.common.logger import logger

# Essayer d'importer Prophet, fallback si indispo
try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
    logger.info("✅ Prophet disponible pour projections avancées")
except Exception as e:
    PROPHET_AVAILABLE = False
    logger.warning(f"⚠️ Prophet non disponible: {e} → fallback régression linéaire")

try:
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.preprocessing import StandardScaler
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


class ProjectionEngine:
    """
    Moteur de projection intelligent avec sélection automatique PROPRE
    ✅ GARDE LE FORMAT JSON EXISTANT - améliore seulement la logique interne
    """
    
    @staticmethod
    def project_sales(history_data, periods=6, method='auto'):
        """
        Projection intelligente - Version simplifiée et fiable
        
        Args:
            history_data: List[(periode, qte)] - Données historiques
            periods: int - Nombre de mois à projeter
            method: str - 'auto', 'prophet', 'linear'
        
        Returns:
            dict avec projections + métadonnées de base
        """
        if not history_data or len(history_data) == 0:
            return ProjectionEngine._empty_projection(periods)
        
        # Sélection automatique SIMPLIFIÉE
        if method == 'auto':
            method = ProjectionEngine._select_method_simple(history_data)
        
        logger.debug(f"✅ Projection avec méthode: {method} pour {len(history_data)} points")
        
        # Dispatch vers la méthode appropriée
        if method == 'prophet' and PROPHET_AVAILABLE:
            return ProjectionEngine._project_with_prophet_clean(history_data, periods)
        else:
            return ProjectionEngine._project_with_linear_clean(history_data, periods)
    
    @staticmethod
    def _select_method_simple(history_data):
        """Sélection simple et conservatrice"""
        data_points = len(history_data)
        
        # Prophet UNIQUEMENT si on a vraiment assez de données
        if PROPHET_AVAILABLE and data_points >= 24:  # 2 ans minimum
            values = [qte for _, qte in history_data]
            # Et si les données sont assez stables
            if len(values) > 1:
                cv = np.std(values) / max(np.mean(values), 1)
                if cv < 2.0:  # Pas trop chaotique
                    logger.info(f"🚀 Prophet sélectionné: {data_points} mois de données stables")
                    return 'prophet'
        
        # Sinon, toujours linéaire (fiable)
        logger.info(f"📈 Régression linéaire sélectionnée: {data_points} mois")
        return 'linear'
    
    @staticmethod
    def _project_with_prophet_clean(history_data, periods):
        """Prophet avec configuration SIMPLE et FIABLE"""
        try:
            # Préparation données
            df = pd.DataFrame({
                'ds': pd.to_datetime([f"{periode}-01" for periode, _ in history_data]),
                'y': [float(qte) for _, qte in history_data]
            })
            
            # Configuration Prophet CONSERVATIVE
            model = Prophet(
                yearly_seasonality=True,
                weekly_seasonality=False,
                daily_seasonality=False,
                changepoint_prior_scale=0.1,  # Conservative
                seasonality_prior_scale=0.5,  # Modéré
                interval_width=0.8,           # 80% confiance
                mcmc_samples=0                # Performance
            )
            
            # Entraînement
            model.fit(df)
            
            # Prédiction
            future = model.make_future_dataframe(periods=periods, freq='M')
            forecast = model.predict(future)
            
            # Extraction des dernières prédictions
            projections = forecast.tail(periods)
            
            # Validation des résultats
            predictions = np.maximum(projections['yhat'].values, 0)
            lower_bounds = np.maximum(projections['yhat_lower'].values, 0)
            upper_bounds = np.maximum(projections['yhat_upper'].values, 0)
            
            # Contrainte de croissance raisonnable
            historical_avg = np.mean([qte for _, qte in history_data])
            for i in range(len(predictions)):
                # Pas plus de 200% de la moyenne historique
                if predictions[i] > historical_avg * 2:
                    predictions[i] = historical_avg * 1.5
                # Pas moins de 10% de la moyenne historique
                if predictions[i] < historical_avg * 0.1:
                    predictions[i] = historical_avg * 0.3
            
            return {
                'method': 'prophet',
                'predictions': predictions.tolist(),
                'lower_bound': lower_bounds.tolist(),
                'upper_bound': upper_bounds.tolist(),
                'model_quality': 'advanced',
                'confidence_interval': 0.8
            }
            
        except Exception as e:
            logger.warning(f"❌ Prophet échoué: {e}, fallback linéaire")
            return ProjectionEngine._project_with_linear_clean(history_data, periods)
    
    @staticmethod
    def _project_with_linear_clean(history_data, periods):
        """Régression linéaire SIMPLE et FIABLE"""
        try:
            values = [float(qte) for _, qte in history_data]
            
            # Cas spécial : une seule valeur
            if len(values) == 1:
                pred = values[0]
                return {
                    'method': 'constant',
                    'predictions': [pred] * periods,
                    'lower_bound': [pred * 0.7] * periods,
                    'upper_bound': [pred * 1.3] * periods,
                    'model_quality': 'basic'
                }
            
            # Régression linéaire avec numpy
            x = np.arange(len(values))
            slope, intercept = np.polyfit(x, values, 1)
            
            # Calcul R² pour évaluer la qualité
            y_pred = slope * x + intercept
            ss_res = np.sum((values - y_pred) ** 2)
            ss_tot = np.sum((values - np.mean(values)) ** 2)
            r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
            
            # Projections futures
            future_x = np.arange(len(values), len(values) + periods)
            predictions = slope * future_x + intercept
            predictions = np.maximum(predictions, 0)  # Pas de négatif
            
            # Contraintes de croissance raisonnable
            historical_avg = np.mean(values)
            last_value = values[-1]
            
            for i in range(len(predictions)):
                # Limite croissance mensuelle à 50%
                if i == 0:
                    max_growth = last_value * 1.5
                    min_growth = last_value * 0.5
                else:
                    max_growth = predictions[i-1] * 1.3
                    min_growth = predictions[i-1] * 0.7
                
                predictions[i] = max(min_growth, min(predictions[i], max_growth))
            
            # Intervalles de confiance basés sur l'erreur historique
            residuals = values - y_pred
            std_error = np.std(residuals) if len(residuals) > 1 else historical_avg * 0.2
            
            lower_bounds = np.maximum(predictions - 1.5 * std_error, 0)
            upper_bounds = predictions + 1.5 * std_error
            
            return {
                'method': 'linear_regression',
                'predictions': predictions.tolist(),
                'lower_bound': lower_bounds.tolist(),
                'upper_bound': upper_bounds.tolist(),
                'slope': slope,
                'r_squared': max(0, r_squared),
                'model_quality': 'excellent' if r_squared > 0.8 else 'good' if r_squared > 0.5 else 'basic'
            }
            
        except Exception as e:
            logger.error(f"❌ Régression linéaire échouée: {e}")
            return ProjectionEngine._empty_projection(periods)
    
    @staticmethod
    def _project_with_linear_clean(history_data, periods):
        """Régression linéaire SIMPLE et FIABLE"""
        try:
            values = [float(qte) for _, qte in history_data]
            
            # Cas spécial : une seule valeur
            if len(values) == 1:
                pred = values[0]
                return {
                    'method': 'constant',
                    'predictions': [pred] * periods,
                    'lower_bound': [pred * 0.7] * periods,
                    'upper_bound': [pred * 1.3] * periods,
                    'model_quality': 'basic'
                }
            
            # Régression linéaire avec numpy
            x = np.arange(len(values))
            slope, intercept = np.polyfit(x, values, 1)
            
            # Calcul R² pour évaluer la qualité
            y_pred = slope * x + intercept
            ss_res = np.sum((values - y_pred) ** 2)
            ss_tot = np.sum((values - np.mean(values)) ** 2)
            r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
            
            # Projections futures
            future_x = np.arange(len(values), len(values) + periods)
            predictions = slope * future_x + intercept
            predictions = np.maximum(predictions, 0)  # Pas de négatif
            
            # Contraintes de croissance raisonnable
            historical_avg = np.mean(values)
            last_value = values[-1]
            
            for i in range(len(predictions)):
                # Limite croissance mensuelle à 50%
                if i == 0:
                    max_growth = last_value * 1.5
                    min_growth = last_value * 0.5
                else:
                    max_growth = predictions[i-1] * 1.3
                    min_growth = predictions[i-1] * 0.7
                
                predictions[i] = max(min_growth, min(predictions[i], max_growth))
            
            # Intervalles de confiance basés sur l'erreur historique
            residuals = values - y_pred
            std_error = np.std(residuals) if len(residuals) > 1 else historical_avg * 0.2
            
            lower_bounds = np.maximum(predictions - 1.5 * std_error, 0)
            upper_bounds = predictions + 1.5 * std_error
            
            return {
                'method': 'linear_regression',
                'predictions': predictions.tolist(),
                'lower_bound': lower_bounds.tolist(),
                'upper_bound': upper_bounds.tolist(),
                'slope': slope,
                'r_squared': max(0, r_squared),
                'model_quality': 'excellent' if r_squared > 0.8 else 'good' if r_squared > 0.5 else 'basic'
            }
            
        except Exception as e:
            logger.error(f"❌ Régression linéaire échouée: {e}")
            return ProjectionEngine._empty_projection(periods)
    
    @staticmethod
    def _empty_projection(periods):
        """Projection vide en cas d'échec total"""
        return {
            'method': 'empty',
            'predictions': [0] * periods,
            'lower_bound': [0] * periods,
            'upper_bound': [0] * periods,
            'model_quality': 'none'
        }