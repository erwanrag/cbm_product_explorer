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


async def evaluate_group_optimization(
    payload: ProductIdentifierRequest, db: AsyncSession
) -> GroupOptimizationListResponse:
    logger.info("Démarrage evaluate_group_optimization")

    if is_payload_empty(payload):
        logger.warning("Payload vide")
        return GroupOptimizationListResponse(items=[])

    resolve_start = perf_counter()
    cod_pro_list = payload.cod_pro_list or await get_codpro_list_from_identifier(payload, db)
    if hasattr(cod_pro_list, "cod_pro_list"):
        cod_pro_list = cod_pro_list.cod_pro_list
    if not cod_pro_list:
        logger.warning("Aucun cod_pro trouvé après résolution")
        return GroupOptimizationListResponse(items=[])

    logger.info(f"cod_pro_list résolue: {len(cod_pro_list)} éléments en {perf_counter() - resolve_start:.2f}s")


    # ✅ Tentative de cache
    redis_key = optimisation_key(payload)
    try:
        cached = await redis_client.get(redis_key)
        if cached:
            logger.debug(f"✅ Cache hit optimisation pour {redis_key}")
            return GroupOptimizationListResponse(**json.loads(cached))
    except Exception:
        logger.exception("[Redis] fallback optimisation:group")

    try:
        logger.info("Lancement requête SQL principale avec CTE CodProList")
        sql_start = perf_counter()

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
                WHERE v.dat_mvt >= DATEADD(YEAR, -1, GETDATE())
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

        history = await _get_sales_history_for_trend(cod_pro_list, db)
        logger.info(f"Historique récupéré pour {len(history)} groupes")

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

            historique_6m = _format_historique_6m(history, g, qual, px_vente_pondere, px_min)
            projection_6m = _project_next_6_months(history, g, qual, px_vente_pondere, px_min)

            kept = sorted(products, key=lambda x: (-x["ca"] / max(x["px_achat"], 1)))[:2]
            kept_ids = {k["cod_pro"] for k in kept}
            refs_to_delete = [p for p in products if p["cod_pro"] not in kept_ids]
            refs_low_sales = [p for p in refs_to_delete if p["ca"] > 0]
            refs_no_sales = [p for p in refs_to_delete if p["ca"] == 0]

            for r in refs_low_sales:
                r["gain_potentiel_par_ref"] = round((px_vente_pondere - px_min) * r["qte"], 2)
            for r in refs_no_sales:
                r["gain_potentiel_par_ref"] = 0

            items.append({
                "grouping_crn": int(g),
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
              AND v.dat_mvt >= DATEADD(MONTH,-6,GETDATE())
              AND dp.qualite IN ('OEM','PMQ','PMV')
            GROUP BY dp.grouping_crn, dp.qualite, CONVERT(VARCHAR(7), v.dat_mvt, 120)
            ORDER BY dp.grouping_crn, dp.qualite, periode
        """
        result = await db.execute(text(query), params)
        rows = result.fetchall()

        data = {}
        for g, qual, periode, qte in rows:
            key = (g, qual)
            data.setdefault(key, []).append((periode, float(qte or 0)))

        logger.debug(f"Historique tendance récupéré: {len(data)} groupes")
        return data

    except SQLAlchemyError as e:
        logger.error(f"Erreur SQL _get_sales_history_for_trend: {e}")
        return {}
    except Exception as e:
        logger.error(f"Erreur inattendue _get_sales_history_for_trend: {e}")
        return {}


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


def _project_next_6_months(history, grouping_crn, qualite, px_vente_pondere, px_achat_min):
    key = (grouping_crn, qualite)
    series = history.get(key, [])
    if len(series) > 100:
        logger.warning(f"❗ Série anormalement longue ({len(series)} mois) pour {grouping_crn}-{qualite}, projection désactivée")
        return {
            "taux_croissance": 0.0,
            "mois": [],
            "totaux": {"qte": 0, "ca": 0, "marge": 0}
        }
    logger.debug(f"Projection {grouping_crn}-{qualite} avec {len(series)} mois historiques")

    if not series:
        return {
            "taux_croissance": 0.0,
            "mois": [],
            "totaux": {"qte": 0, "ca": 0, "marge": 0}
        }

    series_sorted = sorted(series, key=lambda x: x[0])
    y = np.array([q for _, q in series_sorted])
    x = np.arange(len(y))

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
            qte = min(qte, projections[-1]["qte"] * 1.2)

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
