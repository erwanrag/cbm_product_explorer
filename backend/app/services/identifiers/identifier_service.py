from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.common.redis_client import redis_client
from app.cache.cache_keys import resolve_codpro_key
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest, CodProListResponse
from app.common.constants import REDIS_TTL_SHORT
from app.common.logger import logger
from app.common.strings import normalize_ref_ext
import json


async def get_codpro_list_from_identifier(payload: ProductIdentifierRequest, db: AsyncSession) -> CodProListResponse:
    """
    Résout la liste des cod_pro à partir d'un identifiant produit (cod_pro, ref_crn, ref_ext…)
    avec prise en compte du grouping_crn et de la qualité.
    Retourne toujours un CodProListResponse (Pydantic).
    Version optimisée pour réduire les latences.
    """

    # ✅ 1) Vérifie d'abord dans Redis
    redis_key = resolve_codpro_key(**payload.model_dump())
    try:
        cached = await redis_client.get(redis_key)
        if cached:
            logger.debug(f"✅ Cache hit pour {redis_key}")
            return CodProListResponse(**json.loads(cached))
    except Exception:
        logger.exception("[Redis] fallback get_codpro_list_from_identifier")

    resolved: list[int] = []

    # ✅ 2) Logique principale OPTIMISÉE
    try:
        if payload.grouping_crn == 1 and payload.cod_pro:
            # Résolution via grouping_crn depuis un cod_pro direct - REQUÊTE UNIQUE
            resolved = await _resolve_grouping_from_codpro(db, payload.cod_pro, payload.qualite)
            
        elif payload.grouping_crn == 1 and payload.ref_crn:
            # Résolution via grouping_crn depuis une ref_crn - REQUÊTE UNIQUE  
            resolved = await _resolve_grouping_from_ref_crn(db, payload.ref_crn, payload.qualite)

        elif payload.ref_crn:
            # Résolution simple via ref_crn
            resolved = await _get_codpro_from_cle(db, type_cle=1, valeur_crn=payload.ref_crn, qualite=payload.qualite)

        elif payload.ref_ext:
            # Résolution via ref_ext (optimisée avec index)
            resolved = await _resolve_from_ref_ext(db, payload.ref_ext)

        elif payload.cod_pro:
            # Cas simple : cod_pro direct
            resolved = [payload.cod_pro]

        # ✅ 3) Single cod_pro si demandé
        if getattr(payload, "single_cod_pro", False):
            resolved = [resolved[0]] if resolved else []

    except SQLAlchemyError as e:
        logger.error(f"❌ Erreur SQL résolution identifiant: {e}")
        resolved = []
    except Exception as e:
        logger.error(f"❌ Erreur résolution identifiant: {e}")
        resolved = []

    # ✅ 4) Sauvegarde dans Redis (async, non-bloquant)
    try:
        result_data = {"cod_pro_list": resolved}
        await redis_client.set(redis_key, json.dumps(result_data), ex=REDIS_TTL_SHORT)
        logger.debug(f"✅ Cache saved pour {len(resolved)} cod_pro")
    except Exception:
        logger.exception("[Redis] set failed get_codpro_list_from_identifier")

    # ✅ 5) Retour Pydantic
    return CodProListResponse(cod_pro_list=resolved)


async def _resolve_grouping_from_codpro(db: AsyncSession, cod_pro: int, qualite: str | None) -> list[int]:
    """
    Résolution grouping_crn depuis cod_pro en une seule requête optimisée.
    Version sécurisée sans injection SQL.
    """
    query = text("""
        WITH GroupingCTE AS (
            SELECT TOP 1 grouping_crn
            FROM CBM_DATA.Pricing.Dimensions_Produit WITH (NOLOCK)
            WHERE cod_pro = :cod_pro AND grouping_crn IS NOT NULL
        )
        SELECT DISTINCT dp.cod_pro
        FROM GroupingCTE g
        INNER JOIN CBM_DATA.Pricing.Dimensions_Produit dp WITH (NOLOCK) 
            ON dp.grouping_crn = g.grouping_crn
        WHERE (:qualite IS NULL OR dp.qualite = :qualite)
        ORDER BY dp.cod_pro
    """)
    
    try:
        result = await db.execute(query, {
            "cod_pro": int(cod_pro),  # Force le type
            "qualite": qualite if qualite else None
        })
        rows = result.fetchall()
        resolved = [int(r[0]) for r in rows]
        logger.debug(f"🎯 Grouping depuis cod_pro {cod_pro}: {len(resolved)} résultats")
        return resolved if resolved else [cod_pro]
    except SQLAlchemyError as e:
        logger.error(f"❌ Erreur SQL grouping depuis cod_pro {cod_pro}: {e}")
        return [cod_pro]
    except Exception as e:
        logger.error(f"❌ Erreur inattendue grouping depuis cod_pro {cod_pro}: {e}")
        return [cod_pro]


async def _resolve_grouping_from_ref_crn(db: AsyncSession, ref_crn: str, qualite: str | None) -> list[int]:
    """
    Résolution grouping_crn depuis ref_crn en une seule requête optimisée.
    Version sécurisée sans injection SQL.
    """
    query = text("""
        WITH GroupingCTE AS (
            SELECT TOP 1 grouping_crn
            FROM CBM_DATA.Pricing.Dimensions_Produit WITH (NOLOCK)
            WHERE ref_crn = :ref_crn AND grouping_crn IS NOT NULL
        )
        SELECT DISTINCT dp.cod_pro
        FROM GroupingCTE g
        INNER JOIN CBM_DATA.Pricing.Dimensions_Produit dp WITH (NOLOCK) 
            ON dp.grouping_crn = g.grouping_crn
        WHERE (:qualite IS NULL OR dp.qualite = :qualite)
        ORDER BY dp.cod_pro
    """)
    
    try:
        result = await db.execute(query, {
            "ref_crn": str(ref_crn),  # Force le type
            "qualite": qualite if qualite else None
        })
        rows = result.fetchall()
        resolved = [int(r[0]) for r in rows]
        logger.debug(f"🎯 Grouping depuis ref_crn {ref_crn}: {len(resolved)} résultats")
        return resolved
    except SQLAlchemyError as e:
        logger.error(f"❌ Erreur SQL grouping depuis ref_crn {ref_crn}: {e}")
        return []
    except Exception as e:
        logger.error(f"❌ Erreur inattendue grouping depuis ref_crn {ref_crn}: {e}")
        return []


async def _resolve_from_ref_ext(db: AsyncSession, ref_ext: str) -> list[int]:
    """
    Résolution optimisée depuis ref_ext avec stratégie de recherche progressive.
    Version sécurisée sans injection SQL.
    """
    # 1) Recherche exacte d'abord (plus rapide)
    query_exact = text("""
        SELECT cod_pro
        FROM CBM_DATA.dm.Dim_Produit WITH (NOLOCK)
        WHERE UPPER(refext) = :ref_ext_upper
    """)
    
    try:
        result = await db.execute(query_exact, {
            "ref_ext_upper": str(ref_ext).upper()
        })
        rows = result.fetchall()
        if rows:
            resolved = [int(r[0]) for r in rows]
            logger.debug(f"✅ Match exact ref_ext: {len(resolved)} résultats")
            return resolved
    except SQLAlchemyError as e:
        logger.error(f"❌ Erreur SQL recherche exacte ref_ext {ref_ext}: {e}")
    except Exception as e:
        logger.error(f"❌ Erreur inattendue recherche exacte ref_ext {ref_ext}: {e}")

    # 2) Si pas de match exact, recherche normalisée
    try:
        normalized_ref_ext = normalize_ref_ext(ref_ext)
        query_normalized = text("""
            SELECT TOP 10 cod_pro
            FROM CBM_DATA.dm.Dim_Produit WITH (NOLOCK)
            WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(refext), '.', ''), '-', ''), '/', ''), '(', ''), ')', '') = :normalized_ref_ext
        """)
        
        result = await db.execute(query_normalized, {
            "normalized_ref_ext": str(normalized_ref_ext)
        })
        rows = result.fetchall()
        resolved = [int(r[0]) for r in rows]
        logger.debug(f"🔍 Match normalisé ref_ext: {len(resolved)} résultats")
        return resolved
    except SQLAlchemyError as e:
        logger.error(f"❌ Erreur SQL recherche normalisée ref_ext {ref_ext}: {e}")
        return []
    except Exception as e:
        logger.error(f"❌ Erreur inattendue recherche normalisée ref_ext {ref_ext}: {e}")
        return []


async def _get_codpro_from_cle(db: AsyncSession, type_cle: int, valeur_crn: str, qualite: str | None) -> list[int]:
    """
    Appel optimisé à la procédure stockée Pricing.sp_Get_CodPro_From_Cle.
    Version sécurisée sans injection SQL.
    """
    proc = text("""
        EXEC CBM_DATA.Pricing.sp_Get_CodPro_From_Cle
            @type_cle = :type_cle,
            @valeur_crn = :valeur_crn,
            @qualite = :qualite
    """)
    
    logger.debug(f"🎯 Appel SP: type_cle={type_cle}, valeur_crn={valeur_crn}, qualite={qualite}")
    
    try:
        result = await db.execute(proc, {
            "type_cle": int(type_cle),
            "valeur_crn": str(valeur_crn),
            "qualite": qualite if qualite else None
        })
        rows = result.fetchall()
        resolved = [int(r[0]) for r in rows]
        logger.debug(f"✅ SP résolu: {len(resolved)} lignes")
        return resolved
    except SQLAlchemyError as e:
        logger.error(f"❌ Erreur SQL appel SP type_cle={type_cle}, valeur_crn={valeur_crn}: {e}")
        return []
    except Exception as e:
        logger.error(f"❌ Erreur inattendue appel SP type_cle={type_cle}, valeur_crn={valeur_crn}: {e}")
        return []