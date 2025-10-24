from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.services.identifiers.identifier_service import get_codpro_list_from_identifier
from app.schemas.optimisation.optimisation_schema import GroupOptimizationListResponse
from app.common.payload_utils import is_payload_empty
from app.common.logger import logger
# from app.cache.cache_keys import optimisation_key
# from app.common.redis_client import redis_client
import json
import numpy as np
from datetime import datetime
from dateutil.relativedelta import relativedelta
from time import perf_counter

# Projection engine
try:
    from app.services.optimisation.projection_service import ProjectionEngine
    PROJECTION_ENGINE_AVAILABLE = True
except ImportError:
    PROJECTION_ENGINE_AVAILABLE = False
    class ProjectionEngine:
        @staticmethod
        def project_sales(history_data, periods=6, method='auto'):
            vals = [float(q) for _,q in history_data] if history_data else []
            if not vals:
                return {'method':'empty','predictions':[0]*periods,'model_quality':'none'}
            if len(vals)==1:
                return {'method':'constant','predictions':[vals[0]]*periods,'model_quality':'basic'}
            x=np.arange(len(vals))
            try: slope,inter=np.polyfit(x,vals,1)
            except: slope,inter=0, np.mean(vals)
            fx=np.arange(len(vals),len(vals)+periods)
            pred=np.maximum(slope*fx+inter,0)
            for i in range(1,len(pred)):
                if pred[i]>pred[i-1]*1.5: pred[i]=pred[i-1]*1.2
            return {'method':'linear_fallback','predictions':pred.tolist(),'slope':float(slope),'model_quality':'basic'}

# Validator (optionnel)
try:
    from app.services.optimisation.projection_validator import ProjectionValidator
    VALIDATOR_AVAILABLE = True
except ImportError:
    VALIDATOR_AVAILABLE = False


# ========================= Helpers =========================

def _bounded(v, lo, hi):
    return float(max(lo, min(hi, v)))

def _compute_group_weights(products):
    """poids quantités + prix achat pondéré (achat & pmp approximé)"""
    qtot = sum(p["qte"] for p in products) or 0.0
    ca_tot = sum(p["ca"] for p in products) or 0.0
    px_vente_pondere = (ca_tot / qtot) if qtot>0 else 0.0

    # Achat pondéré (actuel)
    px_achat_pondere = (sum(p["px_achat"]*p["qte"] for p in products) / qtot) if qtot>0 else 0.0

    # PMP pondéré (si distinct dispo : à brancher ici). A défaut = achat pondéré.
    pmp_pondere = px_achat_pondere

    # ref min (optimisation hypothétique)
    px_min = min([p["px_achat"] for p in products if p["px_achat"]>0] or [0.0])
    pmp_min = px_min  # TODO: remplacer si PMP ref est disponible

    return px_vente_pondere, px_achat_pondere, pmp_pondere, px_min, pmp_min, qtot, ca_tot


def _coverage_factor_global(part_kept):
    """C_global = 0.6 + 0.4 * sqrt(part_kept)  ⇒ borné [0.5, 1.0]"""
    return _bounded(0.6 + 0.4*np.sqrt(max(0.0, min(1.0, part_kept))), 0.5, 1.0)


def _coverage_factor_month(C_global, qte_m, qte_avg12):
    """C_m = C_global * sqrt(qte_m / qte_avg12)  ⇒ borné [0.5, 1.0]"""
    if qte_avg12 <= 0:
        return C_global
    ratio = np.sqrt(max(0.0, qte_m / qte_avg12))
    return _bounded(C_global * ratio, 0.5, 1.0)


# ========================= Service =========================

async def evaluate_group_optimization(payload: ProductIdentifierRequest, db: AsyncSession) -> GroupOptimizationListResponse:
    logger.info("Démarrage evaluate_group_optimization")
    if is_payload_empty(payload):
        return GroupOptimizationListResponse(items=[])

    resolve_start = perf_counter()
    cod_pro_list = payload.cod_pro_list or await get_codpro_list_from_identifier(payload, db)
    if hasattr(cod_pro_list, "cod_pro_list"):
        cod_pro_list = cod_pro_list.cod_pro_list
    if not cod_pro_list:
        return GroupOptimizationListResponse(items=[])
    logger.info(f"cod_pro_list résolue: {len(cod_pro_list)} éléments en {perf_counter() - resolve_start:.2f}s")

    try:
        # ========= SQL principale (profil simple) =========
        cte_lines = [f"SELECT CAST(:p0 AS INT) AS cod_pro"]
        cte_lines += [f"UNION ALL SELECT CAST(:p{i} AS INT)" for i in range(1, len(cod_pro_list))]
        codpro_cte = "\n".join(cte_lines)
        params = {f"p{i}": int(cod) for i, cod in enumerate(cod_pro_list)}

        query = f"""
            WITH CodProList AS ({codpro_cte}),
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
                WHERE v.dat_mvt >= '2024-01-01'
                  AND v.dat_mvt < DATEADD(DAY, 1-DAY(CONVERT(DATE, GETDATE())), CONVERT(DATE, GETDATE()))
                GROUP BY v.cod_pro
            )
            SELECT dp.grouping_crn, dp.qualite, dp.cod_pro, dp.refint,
                   ISNULL(a.px_achat,0) AS px_achat,
                   ISNULL(s.ca_total,0) AS ca_total,
                   ISNULL(s.quantite_total,0) AS qte_total
            FROM (SELECT DISTINCT cod_pro, refint, grouping_crn, qualite 
                  FROM [CBM_DATA].[Pricing].[Grouping_crn_table] WITH (NOLOCK)) dp
            JOIN CodProList c ON dp.cod_pro = c.cod_pro
            LEFT JOIN Achat a ON dp.cod_pro = a.cod_pro
            LEFT JOIN Sales s ON dp.cod_pro = s.cod_pro
            WHERE dp.qualite IN ('OEM','PMQ','PMV')
            OPTION (RECOMPILE)
        """
        result = await db.execute(text(query), params)
        rows = result.fetchall()

        # =====================================================
        # 🧩 Fusion PMQ/PMV → PM cohérente
        # =====================================================
        groups = {}
        for g, qual, cod, refint, px, ca, qte in rows:
            if not g:
                continue
            qual_group = "PM" if qual in ("PMQ", "PMV") else qual
            key = (g, qual_group)
            groups.setdefault(key, {})
            groups[key][cod] = {
                "cod_pro": int(cod),
                "refint": refint,
                "px_achat": float(px or 0),
                "ca": float(ca or 0),
                "qte": float(qte or 0),
                "qualite_originale": qual
            }

        history = await _get_sales_history_for_trend(cod_pro_list, db)

        items = []
        for (g, qual_group), prod_dict in groups.items():
            products = list(prod_dict.values())
            if len(products) < 1:
                continue

            # 🧠 ici : on garde la version fusionnée (PM) comme clé JSON
            qualite_originale = qual_group
            qualites_combinees = list({p["qualite_originale"] for p in products})

            # ========= Métriques du groupe =========
            px_vente_pondere, px_achat_pondere, pmp_pondere, px_min, pmp_min, qtot, ca_tot = _compute_group_weights(products)

            # Sélection de la meilleure référence
            kept = sorted(products, key=lambda x: x["px_achat"])[:1]
            kept_ids = {k["cod_pro"] for k in kept}
            refs_to_delete = [p for p in products if p["cod_pro"] not in kept_ids]
            refs_low_sales = [p for p in refs_to_delete if p["ca"] > 0]
            refs_no_sales = [p for p in refs_to_delete if p["ca"] == 0]

            for r in refs_low_sales:
                r["gain_potentiel_par_ref"] = round((px_vente_pondere - px_min) * r["qte"], 2)
            for r in refs_no_sales:
                r["gain_potentiel_par_ref"] = 0.0

            # ========= Facteur de couverture =========
            kept_qte_12m = sum(
                entry["qte"]
                for (grp, ql), entries in history.items()
                if (grp, ql) == (g, qual_group)
                for entry in entries
                if entry["cod_pro"] in kept_ids
            )
            group_qte_12m = sum(
                entry["qte"]
                for (grp, ql), entries in history.items()
                if (grp, ql) == (g, qual_group)
                for entry in entries
            ) or 0.0
            part_kept = (kept_qte_12m / group_qte_12m) if group_qte_12m > 0 else 0.0
            C_global = _coverage_factor_global(part_kept)

            # ========= Historique + Projection =========
            historique_12m = _format_historique_12m(
                history, g, qual_group,
                px_vente_pondere, px_achat_pondere, px_min,
                pmp_pondere, pmp_min, C_global
            )

            projection_6m = _project_next_6_months_with_scoring(
                history, g, qual_group,
                px_vente_pondere, px_achat_pondere, px_min,
                pmp_pondere, pmp_min, C_global
            )

            # ========= Synthèse 18M =========
            htot = historique_12m["totaux_12m"]
            ptot = projection_6m.get("totaux", {})

            gain_total_achat_18 = htot.get("gain_manque_achat", 0.0) + ptot.get("gain_potentiel_achat", 0.0)
            gain_total_pmp_18 = htot.get("gain_manque_pmp", 0.0) + ptot.get("gain_potentiel_pmp", 0.0)

            marge_achat_act_18 = htot.get("marge_achat_actuelle", 0.0) + ptot.get("marge_achat_actuelle", 0.0)
            marge_achat_opt_18 = htot.get("marge_achat_optimisee", 0.0) + ptot.get("marge_achat_optimisee", 0.0)

            amelioration_pct = (gain_total_achat_18 / marge_achat_act_18 * 100) if marge_achat_act_18 > 0 else 0.0

            synthese_totale = {
                "gain_manque_achat_12m": round(htot.get("gain_manque_achat", 0.0), 2),
                "gain_manque_pmp_12m": round(htot.get("gain_manque_pmp", 0.0), 2),
                "gain_potentiel_achat_6m": round(ptot.get("gain_potentiel_achat", 0.0), 2),
                "gain_potentiel_pmp_6m": round(ptot.get("gain_potentiel_pmp", 0.0), 2),
                "gain_total_achat_18m": round(gain_total_achat_18, 2),
                "gain_total_pmp_18m": round(gain_total_pmp_18, 2),

                # ✅ Ces deux lignes étaient manquantes
                "marge_pmp_actuelle_18m": round(
                    htot.get("marge_pmp_actuelle", 0.0) + ptot.get("marge_pmp_actuelle", 0.0), 2
                ),
                "marge_pmp_optimisee_18m": round(
                    htot.get("marge_pmp_optimisee", 0.0) + ptot.get("marge_pmp_optimisee", 0.0), 2
                ),

                "marge_achat_actuelle_18m": round(marge_achat_act_18, 2),
                "marge_achat_optimisee_18m": round(marge_achat_opt_18, 2),
                "amelioration_pct": round(amelioration_pct, 2)
            }


            # ========= Ancienne métrique gain_potentiel (immédiat) =========
            marge_actuelle = sum([p["ca"] - p["px_achat"] * p["qte"] for p in products])
            marge_simulee = px_vente_pondere * qtot - px_min * qtot
            gain_potentiel = marge_simulee - marge_actuelle

            # ========= Construction finale item =========
            items.append({
                "grouping_crn": int(g),
                "qualite": qualite_originale,              # ✅ cohérente (OEM, PM, etc.)
                "qualites_combinees": qualites_combinees,  # ✅ PMQ/PMV listées
                "refs_total": len(products),
                "px_achat_min": px_min,
                "px_vente_pondere": round(px_vente_pondere, 2),
                "taux_croissance": projection_6m["taux_croissance"],
                "gain_potentiel": round(gain_potentiel, 2),
                "historique_12m": historique_12m,
                "projection_6m": projection_6m,
                "synthese_totale": synthese_totale,
                "refs_to_keep": kept,
                "refs_to_delete_low_sales": refs_low_sales,
                "refs_to_delete_no_sales": refs_no_sales
            })

        return GroupOptimizationListResponse(items=items)

    except SQLAlchemyError as e:
        logger.error(f"Erreur SQL evaluate_group_optimization: {e}")
        return GroupOptimizationListResponse(items=[])
    except Exception as e:
        logger.error(f"Erreur inattendue evaluate_group_optimization: {e}")
        return GroupOptimizationListResponse(items=[])


async def _get_sales_history_for_trend(cod_pro_list, db: AsyncSession):
    """
    Récupère l’historique des ventes mensuelles depuis janvier 2024
    avec les marges réelles (PA & PMP).
    """
    try:
        placeholders = ", ".join([f":p{i}" for i in range(len(cod_pro_list))])
        params = {f"p{i}": int(cod) for i, cod in enumerate(cod_pro_list)}

        query = f"""
            SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
            SELECT 
                dp.grouping_crn, 
                dp.qualite,
                dp.cod_pro,
                CONVERT(VARCHAR(7), v.dat_mvt, 120) AS periode,
                SUM(v.qte) AS qte,
                SUM(v.tot_vte_eur) AS ca,
                SUM(v.tot_pa_eur) AS total_pa,
                SUM(v.tot_marge_pa_eur) AS marge_pa,
                SUM(v.tot_pmp_eur) AS total_pmp,
                SUM(v.tot_marge_pmp_eur) AS marge_pmp,
                MIN(a.px_net_eur) AS px_achat
            FROM CBM_DATA.Pricing.Px_vte_mouvement v WITH (NOLOCK)
            INNER JOIN (
                SELECT DISTINCT cod_pro, grouping_crn, qualite 
                FROM [CBM_DATA].[Pricing].[Grouping_crn_table] WITH (NOLOCK)
            ) dp ON v.cod_pro = dp.cod_pro
            LEFT JOIN CBM_DATA.Pricing.Px_achat_net a WITH (NOLOCK) 
                ON v.cod_pro = a.cod_pro
            WHERE v.cod_pro IN ({placeholders})
              AND v.dat_mvt >= '2024-01-01'
              AND v.dat_mvt < DATEADD(DAY, 1-DAY(CONVERT(DATE, GETDATE())), CONVERT(DATE, GETDATE()))
              AND dp.qualite IN ('OEM','PMQ','PMV')
            GROUP BY dp.grouping_crn, dp.qualite, dp.cod_pro, 
                     CONVERT(VARCHAR(7), v.dat_mvt, 120)
            ORDER BY dp.grouping_crn, dp.qualite, periode
        """

        result = await db.execute(text(query), params)
        rows = result.fetchall()

        history = {}
        for row in rows:
            qualite_norm = "PM" if row.qualite in ("PMQ","PMV") else row.qualite
            key = (row.grouping_crn, qualite_norm)
            history.setdefault(key, [])
            history[key].append({
                'cod_pro': row.cod_pro,
                'periode': row.periode,
                'qte': float(row.qte or 0),
                'ca': float(row.ca or 0),
                'total_pa': float(row.total_pa or 0),
                'marge_pa': float(row.marge_pa or 0),
                'total_pmp': float(row.total_pmp or 0),
                'marge_pmp': float(row.marge_pmp or 0),
                'px_achat': float(row.px_achat or 0)
            })

        return history

    except Exception as e:
        logger.error(f"Erreur _get_sales_history_for_trend: {e}")
        return {}



def _format_historique_12m(history, grouping_crn, qualite,
                           px_vte_pond, px_achat_pond, px_min,
                           pmp_pond, pmp_min,
                           C_global):
    """
    Formate l’historique 12 mois en utilisant les marges réelles (achat & PMP)
    + calcule le scénario optimisé avec facteur de couverture.
    """
    key = (grouping_crn, qualite)
    data = history.get(key, [])
    if not data:
        return {
            "mois": [],
            "totaux_12m": {
                "qte_totale": 0, "ca_reel": 0,
                "marge_achat_actuelle": 0, "marge_achat_optimisee": 0, "gain_manque_achat": 0,
                "marge_pmp_actuelle": 0, "marge_pmp_optimisee": 0, "gain_manque_pmp": 0
            }
        }

    # agrégation mensuelle groupe
    mois_data = {}
    for e in data:
        p = e['periode']
        d = mois_data.setdefault(p, {'qte':0,'ca':0,'m_pa':0,'m_pmp':0})
        d['qte'] += e['qte']
        d['ca'] += e['ca']
        d['m_pa'] += e['marge_pa']
        d['m_pmp'] += e['marge_pmp']

    # moyenne 12m pour C_m
    qtes = [d['qte'] for _,d in sorted(mois_data.items())][-12:]
    qte_avg12 = np.mean(qtes) if qtes else 0

    mois_list = []
    t_qte=t_ca=0.0
    t_m_achat_act=t_m_achat_opt=t_gain_achat=0.0
    t_m_pmp_act=t_m_pmp_opt=t_gain_pmp=0.0

    for periode in sorted(mois_data.keys())[-12:]:
        d = mois_data[periode]
        q = d['qte']; ca = d['ca']
        C_m = _coverage_factor_month(C_global, q, qte_avg12)

        # marges réelles (issues de la base)
        m_achat_act = d['m_pa']
        m_pmp_act = d['m_pmp']

        # marges optimisées (hypothétiques)
        m_achat_opt = (px_vte_pond - px_min) * q * C_m
        gain_achat = m_achat_opt - m_achat_act

        m_pmp_opt = (px_vte_pond - pmp_min) * q * C_m
        gain_pmp = m_pmp_opt - m_pmp_act

        mois_list.append({
            "periode": periode,
            "qte_reelle": round(q,2),
            "ca_reel": round(ca,2),

            "marge_achat_actuelle": round(m_achat_act,2),
            "marge_achat_optimisee": round(m_achat_opt,2),
            "gain_manque_achat": round(gain_achat,2),

            "marge_pmp_actuelle": round(m_pmp_act,2),
            "marge_pmp_optimisee": round(m_pmp_opt,2),
            "gain_manque_pmp": round(gain_pmp,2),

            "ca_optimise_theorique": round(px_vte_pond*q*C_m,2),
            "facteur_couverture": round(C_m,3)
        })

        t_qte += q; t_ca += ca
        t_m_achat_act += m_achat_act; t_m_achat_opt += m_achat_opt; t_gain_achat += gain_achat
        t_m_pmp_act += m_pmp_act; t_m_pmp_opt += m_pmp_opt; t_gain_pmp += gain_pmp

    return {
        "mois": mois_list,
        "totaux_12m": {
            "qte_totale": round(t_qte,2),
            "ca_reel": round(t_ca,2),

            "marge_achat_actuelle": round(t_m_achat_act,2),
            "marge_achat_optimisee": round(t_m_achat_opt,2),
            "gain_manque_achat": round(t_gain_achat,2),

            "marge_pmp_actuelle": round(t_m_pmp_act,2),
            "marge_pmp_optimisee": round(t_m_pmp_opt,2),
            "gain_manque_pmp": round(t_gain_pmp,2)
        }
    }


def _project_next_6_months_with_scoring(history, grouping_crn, qualite,
                                        px_vte_pond,
                                        px_achat_pond, px_min,
                                        pmp_pond, pmp_min,
                                        C_global):
    key = (grouping_crn, qualite)
    data = history.get(key, [])
    if not data:
        # structure vide
        now = datetime.today().replace(day=1)
        return {
            "taux_croissance": 0.0,
            "mois": [{
                "periode": (now+relativedelta(months=i)).strftime("%Y-%m"),
                "qte": 0,"ca":0.0,
                "marge_achat_actuelle":0.0,"marge_achat_optimisee":0.0,"gain_potentiel_achat":0.0,
                "marge_pmp_actuelle":0.0,"marge_pmp_optimisee":0.0,"gain_potentiel_pmp":0.0,
                "facteur_couverture": float(C_global)
            } for i in range(6)],
            "totaux": {
                "qte":0,"ca":0.0,
                "marge_achat_actuelle":0.0,"marge_achat_optimisee":0.0,"gain_potentiel_achat":0.0,
                "marge_pmp_actuelle":0.0,"marge_pmp_optimisee":0.0,"gain_potentiel_pmp":0.0
            },
            "metadata": {
                "method":"empty_forced","model_quality":"none",
                "quality_score":0.0,"confidence_level":"none","data_points":0,
                "warnings":["Pas de données historiques"],"recommendations":["Vérifier les ventes depuis 2024-01"],
                "summary":"Aucune vente","evaluation_timestamp":datetime.now().isoformat(),"validator_available":VALIDATOR_AVAILABLE
            }
        }

    # série mensuelle qte
    monthly = {}
    for e in data:
        monthly[e['periode']] = monthly.get(e['periode'],0.0) + e['qte']
    series = sorted(monthly.items())  # [(YYYY-MM, qte)]

    if all(q<=0 for _,q in series):
        now = datetime.today().replace(day=1)
        return {
            "taux_croissance": 0.0,
            "mois": [{
                "periode": (now+relativedelta(months=i)).strftime("%Y-%m"),
                "qte": 0,"ca":0.0,
                "marge_achat_actuelle":0.0,"marge_achat_optimisee":0.0,"gain_potentiel_achat":0.0,
                "marge_pmp_actuelle":0.0,"marge_pmp_optimisee":0.0,"gain_potentiel_pmp":0.0,
                "facteur_couverture": float(C_global)
            } for i in range(6)],
            "totaux": {
                "qte":0,"ca":0.0,
                "marge_achat_actuelle":0.0,"marge_achat_optimisee":0.0,"gain_potentiel_achat":0.0,
                "marge_pmp_actuelle":0.0,"marge_pmp_optimisee":0.0,"gain_potentiel_pmp":0.0
            },
            "metadata": {
                "method":"empty_forced","model_quality":"none",
                "quality_score":0.0,"confidence_level":"none","data_points":len(series),
                "warnings":["Ventes nulles"],"recommendations":["Désactiver si inactif"],
                "summary":"Ventes nulles","evaluation_timestamp":datetime.now().isoformat(),"validator_available":VALIDATOR_AVAILABLE
            }
        }

    # tronquer si trop long
    if len(series)>50:
        series = series[-24:]

    # projection
    if PROJECTION_ENGINE_AVAILABLE:
        try:
            projection_result = ProjectionEngine.project_sales(series, periods=6, method='auto')
        except Exception as e:
            logger.error(f"ProjectionEngine error: {e}")
            projection_result = {'method':'linear_fallback','predictions':[0]*6,'model_quality':'none'}
    else:
        projection_result = {'method':'linear_fallback','predictions':[0]*6,'model_quality':'none'}

    # qualité
    if VALIDATOR_AVAILABLE:
        try:
            business_context = {'price_range': {'min': px_min,'avg': px_vte_pond},
                                'quality_segment': qualite, 'grouping_crn': grouping_crn}
            quality_eval = ProjectionValidator.evaluate_projection_quality(projection_result, series, business_context)
        except Exception as e:
            logger.error(f"Qual eval error: {e}")
            quality_eval = {'quality_score':0.6,'confidence_level':'medium','warnings':[],'recommendations':[],
                            'summary': f"{projection_result.get('method','unknown')} • {len(series)} mois"}
    else:
        quality_eval = {'quality_score':0.6,'confidence_level':'medium','warnings':[],'recommendations':[],
                        'summary': f"{projection_result.get('method','unknown')} • {len(series)} mois"}

    preds = projection_result['predictions']
    method_used = projection_result.get('method','unknown')
    quality = projection_result.get('model_quality','unknown')

    # C_m basé sur moyenne 12m la plus récente
    last12 = [q for _,q in series][-12:] or [q for _,q in series]
    qte_avg12 = np.mean(last12) if last12 else 0.0

    months=[]; tq=0; tca=0
    t_m_achat_act=t_m_achat_opt=t_gain_achat=0.0
    t_m_pmp_act=t_m_pmp_opt=t_gain_pmp=0.0

    current_month = datetime.today().replace(day=1)
    for i, q in enumerate(preds):
        q = int(max(0, round(q)))
        C_m = _coverage_factor_month(C_global, q, qte_avg12)

        ca = q*px_vte_pond

        m_achat_act = (px_vte_pond - px_achat_pond) * q
        m_achat_opt = (px_vte_pond - px_min) * q * C_m
        gain_achat  = m_achat_opt - m_achat_act

        m_pmp_act = (px_vte_pond - pmp_pond) * q
        m_pmp_opt = (px_vte_pond - pmp_min) * q * C_m
        gain_pmp  = m_pmp_opt - m_pmp_act

        periode = (current_month + relativedelta(months=i)).strftime("%Y-%m")
        months.append({
            "periode": periode,
            "qte": q,
            "ca": round(ca,2),

            "marge_achat_actuelle": round(m_achat_act,2),
            "marge_achat_optimisee": round(m_achat_opt,2),
            "gain_potentiel_achat": round(gain_achat,2),

            "marge_pmp_actuelle": round(m_pmp_act,2),
            "marge_pmp_optimisee": round(m_pmp_opt,2),
            "gain_potentiel_pmp": round(gain_pmp,2),

            "facteur_couverture": round(C_m,3)
        })

        tq+=q; tca+=ca
        t_m_achat_act+=m_achat_act; t_m_achat_opt+=m_achat_opt; t_gain_achat+=gain_achat
        t_m_pmp_act+=m_pmp_act; t_m_pmp_opt+=m_pmp_opt; t_gain_pmp+=gain_pmp

    # taux de croissance (simple)
    if method_used=='linear_regression' and 'slope' in projection_result:
        hist_avg = np.mean([q for _,q in series]) or 1
        taux_croissance = projection_result['slope']/hist_avg
    else:
        if len(preds)>=2:
            slope = (preds[-1]-preds[0])/(len(preds)-1)
            avg   = np.mean(preds) or 1
            taux_croissance = slope/avg
        else:
            taux_croissance = 0.0
    taux_croissance = _bounded(taux_croissance, -0.5, 0.5)

    metadata = {
        "method": method_used,
        "model_quality": quality,
        "quality_score": quality_eval.get('quality_score',0.5),
        "confidence_level": quality_eval.get('confidence_level','medium'),
        "data_points": len(series),
        **{k: v for k, v in projection_result.items() if k in ['r_squared','slope','confidence_interval','lower_bound','upper_bound']},
        "warnings": quality_eval.get('warnings', []),
        "recommendations": quality_eval.get('recommendations', []),
        "summary": quality_eval.get('summary', f"{method_used} • {len(series)} mois"),
        "evaluation_timestamp": datetime.now().isoformat(),
        "validator_available": VALIDATOR_AVAILABLE
    }

    return {
        "taux_croissance": round(taux_croissance,4),
        "mois": months,
        "totaux": {
            "qte": int(tq),
            "ca": round(tca,2),
            "marge_achat_actuelle": round(t_m_achat_act,2),
            "marge_achat_optimisee": round(t_m_achat_opt,2),
            "gain_potentiel_achat": round(t_gain_achat,2),
            "marge_pmp_actuelle": round(t_m_pmp_act,2),
            "marge_pmp_optimisee": round(t_m_pmp_opt,2),
            "gain_potentiel_pmp": round(t_gain_pmp,2)
        },
        "metadata": metadata
    }
