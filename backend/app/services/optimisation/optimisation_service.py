# 📁 app/services/optimisation/optimisation_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.services.identifiers.identifier_service import get_codpro_list_from_identifier
from app.schemas.optimisation.optimisation_schema import GroupOptimizationListResponse
from app.common.payload_utils import is_payload_empty
from app.common.logger import logger
import numpy as np
from datetime import datetime
from dateutil.relativedelta import relativedelta


async def evaluate_group_optimization(
    payload: ProductIdentifierRequest, db: AsyncSession
) -> GroupOptimizationListResponse:
    if is_payload_empty(payload):
        return GroupOptimizationListResponse(products=[])
    """
    Évalue les gains potentiels immédiats et à 6 mois par groupe et qualité (avec projection réaliste).
    """

    # ✅ 1. Résolution cod_pro_list
    cod_pro_list = payload.cod_pro_list or await get_codpro_list_from_identifier(payload, db)
    if hasattr(cod_pro_list, "cod_pro_list"):
        cod_pro_list = cod_pro_list.cod_pro_list
    if not cod_pro_list:
        return GroupOptimizationListResponse(items=[])

    placeholders = ", ".join([f":p{i}" for i in range(len(cod_pro_list))])
    params = {f"p{i}": cod for i, cod in enumerate(cod_pro_list)}

    # ✅ 2. Requête SQL agrégée (Achat & Sales sur 12 derniers mois)
    query = f"""
        WITH Achat AS (
            SELECT cod_pro, MIN(px_net_eur) AS px_achat
            FROM CBM_DATA.Pricing.Px_achat_net
            WHERE cod_pro IN ({placeholders})
            GROUP BY cod_pro
        ),
        Sales AS (
            SELECT cod_pro, SUM(tot_vte_eur) AS ca_total, SUM(qte) AS quantite_total
            FROM CBM_DATA.Pricing.Px_vte_mouvement
            WHERE cod_pro IN ({placeholders})
              AND dat_mvt >= DATEADD(YEAR, -1, GETDATE())
            GROUP BY cod_pro
        )
        SELECT dp.grouping_crn, dp.qualite, dp.cod_pro,
               ISNULL(a.px_achat,0) AS px_achat,
               ISNULL(s.ca_total,0) AS ca_total,
               ISNULL(s.quantite_total,0) AS qte_total
        FROM (SELECT DISTINCT grouping_crn, qualite, cod_pro FROM CBM_DATA.Pricing.Dimensions_Produit) dp
        LEFT JOIN Achat a ON dp.cod_pro = a.cod_pro
        LEFT JOIN Sales s ON dp.cod_pro = s.cod_pro
        WHERE dp.cod_pro IN ({placeholders})
          AND dp.qualite IN ('OEM','PMQ','PMV')
    """
    result = await db.execute(text(query), {**params})
    rows = result.fetchall()

    # ✅ 3. Récupération historique pour tendance (6 derniers mois)
    history = await _get_sales_history_for_trend(cod_pro_list, db)

    # ✅ 4. Groupement par grouping_crn + qualité
    groups = {}
    for g, qual, cod, px, ca, qte in rows:
        if not g:
            continue
        key = (g, qual)
        groups.setdefault(key, {})
        groups[key][cod] = {
            "cod_pro": cod,
            "px_achat": float(px or 0),
            "ca": float(ca or 0),
            "qte": float(qte or 0)
        }

    # ✅ 5. Calculs par groupe
    items = []
    for (g, qual), prod_dict in groups.items():
        products = list(prod_dict.values())
        if len(products) <= 2:
            continue

        px_min = min([p["px_achat"] for p in products if p["px_achat"] > 0] or [0])
        qte_total = sum(p["qte"] for p in products)
        ca_total = sum(p["ca"] for p in products)
        px_vente_pondere = (ca_total / qte_total) if qte_total > 0 else 0

        marge_actuelle = sum([p["ca"] - p["px_achat"] * p["qte"] for p in products])
        marge_simulee = px_vente_pondere * qte_total - px_min * qte_total
        gain_potentiel = marge_simulee - marge_actuelle

        # ✅ Historique formaté
        historique_6m = _format_historique_6m(history, g, qual, px_vente_pondere, px_min)

        # ✅ Projection réaliste sur 6 mois
        projection_6m = _project_next_6_months(history, g, qual, px_vente_pondere, px_min)

        # ✅ Sélection des refs à garder/supprimer
        kept = sorted(products, key=lambda x: (-x["ca"] / max(x["px_achat"], 1)))[:2]
        kept_ids = {k["cod_pro"] for k in kept}
        refs_to_delete = [p for p in products if p["cod_pro"] not in kept_ids]
        refs_low_sales = [p for p in refs_to_delete if p["ca"] > 0]
        refs_no_sales = [p for p in refs_to_delete if p["ca"] == 0]

        # Ajout du gain par référence
        for r in refs_low_sales:
            r["gain_potentiel_par_ref"] = round(
                (px_vente_pondere - px_min) * r["qte"], 2
            )
        for r in refs_no_sales:
            r["gain_potentiel_par_ref"] = 0

        items.append({
            "grouping_crn": g,
            "qualite": qual,
            "refs_total": len(products),
            "px_achat_min": px_min,
            "px_vente_pondere": round(px_vente_pondere, 2),
            "taux_croissance": projection_6m["taux_croissance"],
            "gain_potentiel": round(gain_potentiel, 2),
            "gain_potentiel_6m": round(projection_6m["totaux"]["marge"], 2),
            "historique_6m": historique_6m,
            "projection_6m": projection_6m,
            "refs_to_keep": kept,
            "refs_to_delete_low_sales": refs_low_sales,
            "refs_to_delete_no_sales": refs_no_sales
        })

    return GroupOptimizationListResponse(items=items)


# ✅ Fonction historique (6 derniers mois)
def _format_historique_6m(history, grouping_crn, qualite, px_vente_pondere, px_achat_min):
    key = (grouping_crn, qualite)
    series = history.get(key, [])
    series_sorted = sorted(series, key=lambda x: x[0])

    historique = []
    for periode, qte in series_sorted:
        ca = qte * px_vente_pondere
        marge = (px_vente_pondere - px_achat_min) * qte
        historique.append({
            "periode": periode,
            "qte": round(qte),
            "ca": round(ca, 2),
            "marge": round(marge, 2)
        })
    return historique


# ✅ Fonction projection réaliste (régression linéaire)
def _project_next_6_months(history, grouping_crn, qualite, px_vente_pondere, px_achat_min):
    key = (grouping_crn, qualite)
    series = history.get(key, [])
    if not series:
        return {
            "taux_croissance": 0.0,
            "mois": [],
            "totaux": {"qte": 0, "ca": 0, "marge": 0}
        }

    # --- Tri historique ---
    series_sorted = sorted(series, key=lambda x: x[0])
    y = np.array([q for _, q in series_sorted])
    x = np.arange(len(y))

    # --- Régression linéaire ---
    slope, intercept = (0, y[-1] if len(y) > 0 else 0)
    if len(y) >= 2:
        slope, intercept = np.polyfit(x, y, 1)

    taux_croissance = slope / max(np.mean(y), 1)

    projections = []
    total_qte = total_ca = total_marge = 0
    current_month = datetime.today().replace(day=1)

    for i in range(6):
        mois_index = len(y) + i
        qte = max(0, intercept + slope * mois_index)
        if projections:
            qte = min(qte, projections[-1]["qte"] * 1.2)  # cap 20%/mois

        ca = qte * px_vente_pondere
        marge = (px_vente_pondere - px_achat_min) * qte

        periode = (current_month + relativedelta(months=i)).strftime("%Y-%m")
        projections.append({
            "periode": periode,
            "qte": round(qte),
            "ca": round(ca, 2),
            "marge": round(marge, 2)
        })
        total_qte += qte
        total_ca += ca
        total_marge += marge

    return {
        "taux_croissance": round(taux_croissance, 4),
        "mois": projections,
        "totaux": {
            "qte": round(total_qte),
            "ca": round(total_ca, 2),
            "marge": round(total_marge, 2)
        }
    }


# ✅ Historique ventes (6 derniers mois)
async def _get_sales_history_for_trend(cod_pro_list, db: AsyncSession):
    placeholders = ", ".join([f":p{i}" for i in range(len(cod_pro_list))])
    params = {f"p{i}": cod for i, cod in enumerate(cod_pro_list)}

    query = f"""
        SELECT dp.grouping_crn, dp.qualite,
               FORMAT(v.dat_mvt,'yyyy-MM') AS periode,
               SUM(v.qte) AS qte
        FROM CBM_DATA.Pricing.Px_vte_mouvement v
        LEFT JOIN (SELECT DISTINCT grouping_crn, qualite, cod_pro
                   FROM CBM_DATA.Pricing.Dimensions_Produit) dp
        ON v.cod_pro = dp.cod_pro
        WHERE v.cod_pro IN ({placeholders})
          AND v.dat_mvt >= DATEADD(MONTH,-6,GETDATE())
          AND dp.qualite IN ('OEM','PMQ','PMV')
        GROUP BY dp.grouping_crn, dp.qualite, FORMAT(v.dat_mvt,'yyyy-MM')
        ORDER BY dp.grouping_crn, dp.qualite, periode
    """
    result = await db.execute(text(query), params)
    rows = result.fetchall()

    data = {}
    for g, qual, periode, qte in rows:
        key = (g, qual)
        data.setdefault(key, []).append((periode, float(qte or 0)))
    return data
