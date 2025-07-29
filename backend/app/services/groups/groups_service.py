import json
import time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from fastapi import HTTPException

from app.schemas.groups.groups_schema import GroupsFilterRequest
from app.common.redis_client import redis_client
from app.common.constants import REDIS_TTL_SHORT
from app.common.logger import logger
from app.cache.cache_keys import groups_key

async def get_groups(
    payload: GroupsFilterRequest,
    db: AsyncSession,
    page: int = 0,
    limit: int = 100,
):
    redis_key = groups_key(payload.model_dump(), page, limit)
    try:
        cached = await redis_client.get(redis_key)
        if cached:
            return json.loads(cached)
    except Exception:
        logger.exception("[Redis] groups fallback")

    limit = max(min(limit, 400), 10)
    offset = max(page, 0) * limit

    # Filtres dynamiques
    where = []
    params = {
        "offset": offset,
        "limit": limit,
    }
    if payload.ref_crn:
        where.append("grouping_crn = :ref_crn")
        params["ref_crn"] = payload.ref_crn
    if payload.famille:
        where.append("famille = :famille")
        params["famille"] = payload.famille
    if payload.qualite:
        where.append("qualite = :qualite")
        params["qualite"] = payload.qualite
    if payload.statut:
        where.append("statut = :statut")
        params["statut"] = payload.statut

    where_clause = " AND ".join(where) if where else "1=1"

    count_query = f"""
        SELECT COUNT(DISTINCT grouping_crn)
        FROM CBM_DATA.dm.Dim_Produit WITH (NOLOCK)
        WHERE {where_clause}
    """

    query = f"""
      SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
      SELECT
        grouping_crn,
        COUNT(DISTINCT cod_pro) as nb_produits,
        STRING_AGG(DISTINCT famille, ', ') as familles,
        MAX(qualite) as qualite,
        MAX(nom_fou) as fournisseur,
        MAX(statut) as statut,
        SUM(qte) as qte_totale,
        SUM(tot_vte_eur) as ca_total,
        SUM(tot_marge_pr_eur) as marge_total
      FROM CBM_DATA.dm.Dim_Produit WITH (NOLOCK)
      LEFT JOIN CBM_DATA.Pricing.Px_vte_mouvement mvt ON Dim_Produit.cod_pro = mvt.cod_pro
      LEFT JOIN CBM_DATA.dm.Fact_Produit_Depot_Fournisseur fou ON Dim_Produit.cod_pro = fou.cod_pro
      WHERE {where_clause}
      GROUP BY grouping_crn
      ORDER BY nb_produits DESC
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    """

    # Si besoin, adapte les champs (grouping_crn, familles, etc.) selon ta base

    result_count = await db.execute(text(count_query), params)
    total = result_count.scalar() or 0

    start = time.perf_counter()
    result = await db.execute(text(query), params)
    rows = result.fetchall()
    elapsed = (time.perf_counter() - start) * 1000
    logger.info(f"[get_groups] {len(rows)} groupes chargés en {elapsed:.1f} ms")

    data = {
        "total": total,
        "rows": [
            {
                "grouping_crn": r[0],
                "nb_produits": r[1],
                "familles": r[2],
                "qualite": r[3],
                "fournisseur": r[4],
                "statut": r[5],
                "qte_totale": r[6],
                "ca_total": r[7],
                "marge_total": r[8],
            }
            for r in rows
        ]
    }
    try:
        await redis_client.set(redis_key, json.dumps(data), ex=REDIS_TTL_SHORT)
    except Exception:
        logger.exception("[Redis] groups set failed")

    return data
