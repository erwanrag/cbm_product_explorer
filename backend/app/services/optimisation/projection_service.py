import pandas as pd
import numpy as np
from datetime import datetime
from dateutil.relativedelta import relativedelta
from app.common.logger import logger
from statsmodels.tsa.holtwinters import ExponentialSmoothing

# Essayer d'importer Prophet, fallback si indispo
try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
    logger.info("✅ Prophet disponible pour projections avancées")
except Exception as e:
    PROPHET_AVAILABLE = False
    logger.warning(f"⚠️ Prophet non disponible: {e} → fallback régression linéaire")

try:
    from sklearn.ensemble import RandomForestRegressor  # noqa
    from sklearn.preprocessing import StandardScaler    # noqa
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


class ProjectionEngine:
    """
    Moteur de projection intelligent
    """
    @staticmethod
    def project_sales(history_data, periods=6, method='auto'):
        if not history_data or len(history_data) == 0:
            return ProjectionEngine._empty_projection(periods)

        if method == 'auto':
            method = ProjectionEngine._select_method_simple(history_data)

        logger.debug(f"✅ Projection avec méthode: {method} pour {len(history_data)} points")

        if method == 'prophet' and PROPHET_AVAILABLE:
            return ProjectionEngine._project_with_prophet_clean(history_data, periods)
        elif method == 'holt':
            return ProjectionEngine._project_with_holt(history_data, periods)
        else:
            return ProjectionEngine._project_with_linear_clean(history_data, periods)

    @staticmethod
    def _select_method_simple(history_data):
        n = len(history_data)
        if PROPHET_AVAILABLE and n >= 18:
            logger.info(f"🚀 Prophet sélectionné ({n} points)")
            return 'prophet'
        if n >= 6:
            logger.info(f"📈 Holt-Winters sélectionné ({n} points)")
            return 'holt'
        logger.info(f"📉 Fallback linéaire ({n} points)")
        return 'linear'

    @staticmethod
    def _project_with_prophet_clean(history_data, periods):
        try:
            df = pd.DataFrame({
                'ds': pd.to_datetime([f"{p}-01" for p,_ in history_data]),
                'y': [float(q) for _,q in history_data]
            })
            model = Prophet(
                yearly_seasonality=True,
                weekly_seasonality=False,
                daily_seasonality=False,
                changepoint_prior_scale=0.1,
                seasonality_prior_scale=0.5,
                interval_width=0.8,
                mcmc_samples=0
            )
            model.fit(df)
            future = model.make_future_dataframe(periods=periods, freq='M')
            fc = model.predict(future).tail(periods)
            y = np.maximum(fc['yhat'].values, 0)
            lo = np.maximum(fc['yhat_lower'].values, 0)
            hi = np.maximum(fc['yhat_upper'].values, 0)

            hist_avg = np.mean([q for _,q in history_data])
            for i in range(len(y)):
                if y[i] > hist_avg*2: y[i] = hist_avg*1.5
                if y[i] < hist_avg*0.1: y[i] = hist_avg*0.3

            hist_total = np.sum([q for _,q in history_data[-12:]])
            proj_total = np.sum(y)
            if proj_total > hist_total*0.7:
                s = (hist_total*0.7)/proj_total
                y *= s; lo *= s; hi *= s

            return {
                'method':'prophet',
                'predictions': y.tolist(),
                'lower_bound': lo.tolist(),
                'upper_bound': hi.tolist(),
                'model_quality':'advanced',
                'confidence_interval':0.8
            }
        except Exception as e:
            logger.warning(f"❌ Prophet échoué: {e}, fallback Holt/Linear")
            return ProjectionEngine._project_with_holt(history_data, periods)

    @staticmethod
    def _project_with_holt(history_data, periods):
        try:
            values = [float(q) for _,q in history_data]
            if not values:
                return ProjectionEngine._empty_projection(periods)
            model = ExponentialSmoothing(values, trend='additive', seasonal=None)
            fit = model.fit(optimized=True)
            y = np.maximum(fit.forecast(periods), 0)

            r2 = 1 - np.var(fit.resid)/np.var(values) if np.var(values)>0 else 0
            hist_total = np.sum(values); proj_total = np.sum(y)
            if proj_total > hist_total*0.8:
                s = (hist_total*0.8)/proj_total
                y *= s

            return {'method':'holt','predictions':y.tolist(),'model_quality':'good' if r2>0.5 else 'basic','r_squared':float(r2)}
        except Exception as e:
            logger.warning(f"❌ Holt échoué: {e}, fallback linéaire")
            return ProjectionEngine._project_with_linear_clean(history_data, periods)

    @staticmethod
    def _project_with_linear_clean(history_data, periods):
        try:
            v = [float(q) for _,q in history_data]
            if len(v)==1:
                pred=v[0]
                return {'method':'constant','predictions':[pred]*periods,'lower_bound':[pred*0.7]*periods,'upper_bound':[pred*1.3]*periods,'model_quality':'basic'}
            x=np.arange(len(v)); slope,inter=np.polyfit(x,v,1)
            y_pred=slope*x+inter
            ss_res=np.sum((v-y_pred)**2); ss_tot=np.sum((v-np.mean(v))**2)
            r2=1-(ss_res/ss_tot) if ss_tot>0 else 0

            fx=np.arange(len(v),len(v)+periods)
            y=slope*fx+inter; y=np.maximum(y,0)
            avg=np.mean(v); last=v[-1]
            for i in range(len(y)):
                if i==0:
                    y[i]=max(last*0.5, min(y[i], last*1.5))
                else:
                    y[i]=max(y[i-1]*0.7, min(y[i], y[i-1]*1.3))
            resid=v-y_pred; se=np.std(resid) if len(resid)>1 else avg*0.2
            lo=np.maximum(y-1.5*se,0); hi=y+1.5*se

            hist_total=np.sum([q for _,q in history_data[-12:]])
            proj_total=np.sum(y)
            if proj_total>hist_total*0.7:
                s=(hist_total*0.7)/proj_total
                y*=s; lo*=s; hi*=s

            return {'method':'linear_regression','predictions':y.tolist(),'lower_bound':lo.tolist(),'upper_bound':hi.tolist(),'slope':float(slope),'r_squared':max(0,float(r2)),'model_quality':'excellent' if r2>0.8 else 'good' if r2>0.5 else 'basic'}
        except Exception as e:
            logger.error(f"❌ Linéaire échouée: {e}")
            return ProjectionEngine._empty_projection(periods)

    @staticmethod
    def _empty_projection(periods):
        return {'method':'empty','predictions':[0]*periods,'lower_bound':[0]*periods,'upper_bound':[0]*periods,'model_quality':'none'}
