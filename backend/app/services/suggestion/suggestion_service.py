from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.common.redis_client import redis_client
from app.common.constants import REDIS_TTL_SHORT
from app.common.logger import logger

import json


async def get_refcrn_by_codpro(cod_pro: int, db: AsyncSession) -> list[str]:
    """
    Retourne la liste des ref_crn associées à un cod_pro donné (multi-référencement possible).
    """
    redis_key = f"suggest:refcrn:{cod_pro}"
    try:
        cached = await redis_client.get(redis_key)
        if cached:
            return json.loads(cached)
    except Exception:
        logger.exception("[Redis] refcrn_by_codpro fallback")

    query = text("""
        SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
        SELECT DISTINCT ref_crn
        FROM CBM_DATA.Pricing.Dimensions_Produit WITH (NOLOCK)
        WHERE cod_pro = :cod_pro AND ref_crn IS NOT NULL
        ORDER BY ref_crn
    """)
    result = await db.execute(query, {"cod_pro": cod_pro})
    data = [row[0] for row in result.fetchall()]

    try:
        await redis_client.set(redis_key, json.dumps(data), ex=REDIS_TTL_SHORT)
    except Exception:
        logger.exception("[Redis] set refcrn_by_codpro failed")

    return data


async def autocomplete_refint_or_codpro(query: str, db: AsyncSession) -> list[dict]:
    """
    Retourne les 10 premiers couples (refint, cod_pro) correspondant à un préfixe.
    """
    sql = """
        SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
        SELECT DISTINCT TOP 10 refint, cod_pro
        FROM CBM_DATA.dm.Dim_Produit WITH (NOLOCK)
        WHERE refint LIKE :q OR CAST(cod_pro AS VARCHAR) LIKE :q
        ORDER BY refint
    """
    result = await db.execute(text(sql), {"q": f"{query}%"})
    return [{"refint": row[0], "cod_pro": row[1]} for row in result.fetchall()]


async def autocomplete_ref_crn(query: str, db: AsyncSession) -> list[str]:
    """
    Retourne les 10 premières références constructeur (ref_crn) correspondant à un préfixe.
    """
    sql = """
        SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
        SELECT DISTINCT TOP 10 ref_crn
        FROM CBM_DATA.Pricing.Bridge_cod_pro_ref_crn WITH (NOLOCK)
        WHERE ref_crn LIKE :q
        ORDER BY ref_crn
    """
    result = await db.execute(text(sql), {"q": f"{query}%"})
    return [row[0] for row in result.fetchall()]


async def autocomplete_ref_ext(query: str, db: AsyncSession) -> list[str]:
    """
    Retourne les 10 premières références externes (ref_ext) correspondant à un préfixe.
    """
    sql = """
        SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
        SELECT DISTINCT TOP 10 refext as ref_ext
        FROM CBM_DATA.dm.Dim_Produit WITH (NOLOCK)
        WHERE refext LIKE :q
        ORDER BY ref_ext
    """
    result = await db.execute(text(sql), {"q": f"{query}%"})
    return [row[0] for row in result.fetchall()]
