from prophet import Prophet
import pandas as pd
import matplotlib.pyplot as plt

# Exemple de données mensuelles simples
data = {
    'ds': pd.date_range(start='2023-01-01', periods=24, freq='M'),
    'y': [100, 120, 130, 140, 160, 170, 180, 200, 190, 210, 220, 230,
          240, 250, 255, 265, 275, 290, 300, 310, 320, 330, 340, 350]
}
df = pd.DataFrame(data)

# Instanciation du modèle
model = Prophet(
    yearly_seasonality=True,
    weekly_seasonality=False,
    daily_seasonality=False
)

# Entraînement
model.fit(df)

# Génération des prévisions pour les 6 prochains mois
future = model.make_future_dataframe(periods=6, freq='M')
forecast = model.predict(future)

# Affichage texte
print(forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(6))

# Affichage graphique (optionnel)
model.plot(forecast)
plt.title("Prévision Prophet (test)")
plt.xlabel("Date")
plt.ylabel("Valeur prédite")
plt.tight_layout()
plt.show()
