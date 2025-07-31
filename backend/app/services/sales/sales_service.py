# ===================================
# 📁 backend/app/services/sales/sales_service.py - VERSION PROPRE ET FONCTIONNELLE
# ===================================

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.common.date_service import get_last_n_months
from app.common.payload_utils import is_payload_empty
from app.services.identifiers.identifier_service import get_codpro_list_from_identifier
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.sales.sales_schema import (
    ProductSalesAggregateResponse,
    ProductSalesHistoryResponse
)
from app.common.logger import logger


async def get_sales_history(
    payload: ProductIdentifierRequest,
    db: AsyncSession,
    last_n_months: int = 12
) -> ProductSalesHistoryResponse:
    """
    Récupère l'historique des ventes (par mois) pour une ou plusieurs références.
    Version sécurisée sans injection SQL.
    """
    if is_payload_empty(payload):
        return ProductSalesHistoryResponse(items=[])

    # ✅ Résolution cod_pro_list
    cod_pro_list = payload.cod_pro_list or await get_codpro_list_from_identifier(payload, db)
    if hasattr(cod_pro_list, "cod_pro_list"):
        cod_pro_list = cod_pro_list.cod_pro_list

    if not cod_pro_list:
        return ProductSalesHistoryResponse(items=[])

    # ✅ Calcul de la période minimale (maintenant corrigé)
    months = get_last_n_months(last_n_months)
    min_period = months[0] + "-01"

    try:
        # ✅ Paramètres sécurisés
        placeholders = ", ".join([f":p{i}" for i in range(len(cod_pro_list))])
        params = {f"p{i}": int(cod) for i, cod in enumerate(cod_pro_list)}
        params["min_period"] = min_period

        query = f"""
            SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
            WITH ventes AS (
                SELECT
                    v.cod_pro,
                    d.refint,
                    CONVERT(VARCHAR(7), v.dat_mvt, 120) AS periode,
                    SUM(v.tot_vte_eur) AS ca,
                    SUM(v.tot_marge_pr_eur) AS marge,
                    SUM(v.qte) AS quantite,
                    CASE WHEN SUM(v.tot_vte_eur) = 0 THEN 0 ELSE
                        100 * SUM(v.tot_marge_pr_eur) / NULLIF(SUM(v.tot_vte_eur), 0)
                    END AS marge_percent
                FROM CBM_DATA.Pricing.Px_vte_mouvement v WITH (NOLOCK)
                LEFT JOIN CBM_DATA.dm.Dim_Produit d WITH (NOLOCK) 
                ON v.cod_pro = d.cod_pro
                WHERE v.cod_pro IN ({placeholders}) AND v.dat_mvt >= :min_period
                GROUP BY v.cod_pro, d.refint, CONVERT(VARCHAR(7), v.dat_mvt, 120)
            )
            SELECT * FROM ventes
            ORDER BY cod_pro, periode
        """
        result = await db.execute(text(query), params)
        rows = result.fetchall()

        items = [
            {
                "cod_pro": int(r[0]),
                "refint": r[1],
                "periode": r[2],
                "ca": float(r[3] or 0),
                "marge": float(r[4] or 0),
                "quantite": float(r[5] or 0),
                "marge_percent": float(r[6] or 0),
            }
            for r in rows
        ]
        logger.debug(f"✅ Historique ventes récupéré: {len(items)} éléments pour période >= {min_period}")
        return ProductSalesHistoryResponse(items=items)

    except SQLAlchemyError as e:
        logger.error(f"❌ Erreur SQL get_sales_history pour cod_pro_list={cod_pro_list}: {e}")
        return ProductSalesHistoryResponse(items=[])
    except Exception as e:
        logger.error(f"❌ Erreur inattendue get_sales_history pour cod_pro_list={cod_pro_list}: {e}")
        return ProductSalesHistoryResponse(items=[])


async def get_sales_aggregate(
    payload: ProductIdentifierRequest,
    db: AsyncSession
) -> ProductSalesAggregateResponse:
    """
    Récupère un agrégat global des ventes pour une ou plusieurs références.
    Version sécurisée sans injection SQL.
    """
    if is_payload_empty(payload):
        return ProductSalesAggregateResponse(items=[])

    # ✅ Résolution cod_pro_list
    cod_pro_list = payload.cod_pro_list or await get_codpro_list_from_identifier(payload, db)
    if hasattr(cod_pro_list, "cod_pro_list"):
        cod_pro_list = cod_pro_list.cod_pro_list

    if not cod_pro_list:
        return ProductSalesAggregateResponse(items=[])

    try:
        # ✅ Paramètres sécurisés
        placeholders = ", ".join([f":p{i}" for i in range(len(cod_pro_list))])
        params = {f"p{i}": int(cod) for i, cod in enumerate(cod_pro_list)}

        query = f"""
            SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
            SELECT
                v.cod_pro,
                d.refint,
                SUM(v.tot_vte_eur) AS ca_total,
                SUM(v.tot_marge_pr_eur) AS marge_total,
                SUM(v.qte) AS quantite_total,
                CASE WHEN SUM(v.tot_vte_eur) = 0 THEN 0 ELSE
                    100 * SUM(v.tot_marge_pr_eur) / NULLIF(SUM(v.tot_vte_eur), 0)
                END AS marge_percent_total
            FROM CBM_DATA.Pricing.Px_vte_mouvement v WITH (NOLOCK)
            LEFT JOIN CBM_DATA.dm.Dim_Produit d WITH (NOLOCK) 
            ON v.cod_pro = d.cod_pro
            WHERE v.dat_mvt >= DATEADD(YEAR, -1, GETDATE())
            AND v.cod_pro IN ({placeholders})
            GROUP BY v.cod_pro, d.refint
            ORDER BY ca_total DESC
        """
        result = await db.execute(text(query), params)
        rows = result.fetchall()

        items = [
            {
                "cod_pro": int(r[0]),
                "refint": r[1],
                "ca_total": float(r[2] or 0),
                "marge_total": float(r[3] or 0),
                "quantite_total": float(r[4] or 0),
                "marge_percent_total": float(r[5] or 0),
            }
            for r in rows
        ]
        logger.debug(f"✅ Agrégat ventes récupéré: {len(items)} éléments")
        return ProductSalesAggregateResponse(items=items)

    except SQLAlchemyError as e:
        logger.error(f"❌ Erreur SQL get_sales_aggregate pour cod_pro_list={cod_pro_list}: {e}")
        return ProductSalesAggregateResponse(items=[])
    except Exception as e:
        logger.error(f"❌ Erreur inattendue get_sales_aggregate pour cod_pro_list={cod_pro_list}: {e}")
        return ProductSalesAggregateResponse(items=[])