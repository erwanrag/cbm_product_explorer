from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.utils.identifier_utils import resolve_codpro_list
from app.common.payload_utils import is_payload_empty
from app.common.date_service import get_last_n_months
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.sales.sales_schema import (
    ProductSalesAggregateResponse,
    ProductSalesHistoryResponse
)
from app.common.logger import logger
from app.cache.cache_keys import sales_agg_key, sales_history_key
from app.common.redis_client import redis_client
import json


async def get_sales_aggregate(
    payload: ProductIdentifierRequest,
    db: AsyncSession
) -> ProductSalesAggregateResponse:
    if is_payload_empty(payload):
        return ProductSalesAggregateResponse(items=[])

    cod_pro_list = await resolve_codpro_list(payload, db)
    if not cod_pro_list:
        return ProductSalesAggregateResponse(items=[])

    redis_key = sales_agg_key(payload)
    try:
        cached = await redis_client.get(redis_key)
        if cached:
            logger.debug(f"✅ Cache hit sales:agg pour {redis_key}")
            return ProductSalesAggregateResponse(**json.loads(cached))
    except Exception:
        logger.exception("[Redis] fallback sales:agg")

    try:
        placeholders = ", ".join([f":p{i}" for i in range(len(cod_pro_list))])
        params = {f"p{i}": cod for i, cod in enumerate(cod_pro_list)}

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

        try:
            await redis_client.set(redis_key, json.dumps({"items": items}), ex=3600)
            logger.debug(f"✅ Cache set sales:agg pour {redis_key}")
        except Exception:
            logger.exception("[Redis] set sales:agg")

        return ProductSalesAggregateResponse(items=items)

    except SQLAlchemyError as e:
        logger.error(f"❌ Erreur SQL get_sales_aggregate pour cod_pro_list={cod_pro_list}: {e}")
        return ProductSalesAggregateResponse(items=[])
    except Exception as e:
        logger.error(f"❌ Erreur inattendue get_sales_aggregate pour cod_pro_list={cod_pro_list}: {e}")
        return ProductSalesAggregateResponse(items=[])


async def get_sales_history(
    payload: ProductIdentifierRequest,
    db: AsyncSession,
    last_n_months: int = 12
) -> ProductSalesHistoryResponse:
    if is_payload_empty(payload):
        return ProductSalesHistoryResponse(items=[])

    cod_pro_list = await resolve_codpro_list(payload, db)
    if not cod_pro_list:
        return ProductSalesHistoryResponse(items=[])

    months = get_last_n_months(last_n_months)
    min_period = months[0] + "-01"

    redis_key = sales_history_key(payload, min_period)
    try:
        cached = await redis_client.get(redis_key)
        if cached:
            logger.debug(f"✅ Cache hit sales:history pour {redis_key}")
            return ProductSalesHistoryResponse(**json.loads(cached))
    except Exception:
        logger.exception("[Redis] fallback sales:history")

    try:
        placeholders = ", ".join([f":p{i}" for i in range(len(cod_pro_list))])
        params = {f"p{i}": cod for i, cod in enumerate(cod_pro_list)}
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

        try:
            await redis_client.set(redis_key, json.dumps({"items": items}), ex=3600)
            logger.debug(f"✅ Cache set sales:history pour {redis_key}")
        except Exception:
            logger.exception("[Redis] set sales:history")

        return ProductSalesHistoryResponse(items=items)

    except SQLAlchemyError as e:
        logger.error(f"❌ Erreur SQL get_sales_history pour cod_pro_list={cod_pro_list}: {e}")
        return ProductSalesHistoryResponse(items=[])
    except Exception as e:
        logger.error(f"❌ Erreur inattendue get_sales_history pour cod_pro_list={cod_pro_list}: {e}")
        return ProductSalesHistoryResponse(items=[])
