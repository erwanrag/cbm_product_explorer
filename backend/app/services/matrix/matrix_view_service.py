from sqlalchemy.ext.asyncio import AsyncSession
from typing import Set, List
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.matrix.matrix_view_schema import (
    MatrixViewResponse, 
    MatrixColumnRef,
    ProductCorrespondence
)
from app.services.products.detail_service import get_product_details  
from app.services.products.match_service import get_codpro_match_list
from app.utils.identifier_utils import resolve_codpro_list
from app.common.logger import logger
from app.common.redis_client import redis_client
from app.cache.cache_keys import matrix_view_key
import json


async def get_matrix_view_data(payload: ProductIdentifierRequest, db: AsyncSession) -> MatrixViewResponse:
    """
    Récupère les données complètes pour la vue matricielle.
    Inclut le cache Redis.
    """
    logger.info(f"🎯 Matrix view request: {payload}")

    cod_pro_list = await resolve_codpro_list(payload, db)
    if not cod_pro_list:
        logger.warning("❌ Aucun produit trouvé")
        return MatrixViewResponse(
            products=[], column_refs=[], correspondences=[],
            total_products=0, total_columns=0, total_correspondences=0
        )

    redis_key = matrix_view_key(payload)
    try:
        cached = await redis_client.get(redis_key)
        if cached:
            logger.debug(f"✅ Cache hit matrix:view pour {redis_key}")
            return MatrixViewResponse(**json.loads(cached))
    except Exception:
        logger.exception("[Redis] fallback matrix:view")

    # Payload enrichi
    payload.cod_pro_list = cod_pro_list
    products_response = await get_product_details(payload, db)
    products = products_response.products

    matches_response = await get_codpro_match_list(payload, db)
    correspondences = [
        ProductCorrespondence(cod_pro=m.cod_pro, ref_crn=m.ref_crn, ref_ext=m.ref_ext)
        for m in matches_response.matches
    ]

    column_refs = _analyze_column_references(correspondences)

    column_type_stats = {}
    for col in column_refs:
        column_type_stats[col.type] = column_type_stats.get(col.type, 0) + 1

    quality_stats = {}
    for p in products:
        q = p.qualite or "Inconnue"
        quality_stats[q] = quality_stats.get(q, 0) + 1

    response = MatrixViewResponse(
        products=products,
        column_refs=column_refs,
        correspondences=correspondences,
        total_products=len(products),
        total_columns=len(column_refs),
        total_correspondences=len(correspondences),
        column_type_stats=column_type_stats,
        quality_stats=quality_stats
    )

    try:
        await redis_client.set(redis_key, json.dumps(response.model_dump()), ex=3600)
        logger.debug(f"✅ Cache enregistré matrix:view pour {redis_key}")
    except Exception:
        logger.exception("[Redis] set matrix:view")

    return response


def _analyze_column_references(correspondences: List[ProductCorrespondence]) -> List[MatrixColumnRef]:
    ref_crn_set: Set[str] = set()
    ref_ext_set: Set[str] = set()

    for c in correspondences:
        if c.ref_crn: ref_crn_set.add(c.ref_crn)
        if c.ref_ext: ref_ext_set.add(c.ref_ext)

    all_refs = ref_crn_set.union(ref_ext_set)
    column_refs = []

    for ref in sorted(all_refs):
        is_in_crn = ref in ref_crn_set
        is_in_ext = ref in ref_ext_set

        if is_in_crn and is_in_ext:
            ref_type = 'both'
            color_code = '#c8e6c9'
        elif is_in_crn:
            ref_type = 'crn_only'
            color_code = '#bbdefb'
        else:
            ref_type = 'ext_only'
            color_code = '#ffcc80'

        column_refs.append(MatrixColumnRef(ref=ref, type=ref_type, color_code=color_code))

    logger.debug(f"🎨 Colonnes analysées: {len(column_refs)}")
    return column_refs


async def get_matrix_view_filtered(
    payload: ProductIdentifierRequest,
    qualite_filter: str = None,
    famille_filter: int = None,
    statut_filter: int = None,
    search_term: str = None,
    db: AsyncSession = None
) -> MatrixViewResponse:
    """
    Version filtrée de la vue matricielle.
    Pas de cache ici : filtrage dynamique.
    """
    base_response = await get_matrix_view_data(payload, db)
    filtered_products = base_response.products

    if qualite_filter:
        filtered_products = [p for p in filtered_products if p.qualite == qualite_filter]
    if famille_filter is not None:
        filtered_products = [p for p in filtered_products if p.famille == famille_filter]
    if statut_filter is not None:
        filtered_products = [p for p in filtered_products if p.statut == statut_filter]
    if search_term:
        s = search_term.lower()
        filtered_products = [
            p for p in filtered_products if s in (p.refint or '').lower() or s in (p.nom_pro or '').lower()
        ]

    filtered_codpros = {p.cod_pro for p in filtered_products}
    filtered_payload = ProductIdentifierRequest(cod_pro_list=list(filtered_codpros))
    matches_response = await get_codpro_match_list(filtered_payload, db)
    filtered_correspondences = [
        ProductCorrespondence(cod_pro=m.cod_pro, ref_crn=m.ref_crn, ref_ext=m.ref_ext)
        for m in matches_response.matches
    ]

    filtered_column_refs = _analyze_column_references(filtered_correspondences)

    column_type_stats = {}
    for c in filtered_column_refs:
        column_type_stats[c.type] = column_type_stats.get(c.type, 0) + 1

    quality_stats = {}
    for p in filtered_products:
        q = p.qualite or 'Inconnue'
        quality_stats[q] = quality_stats.get(q, 0) + 1

    return MatrixViewResponse(
        products=filtered_products,
        column_refs=filtered_column_refs,
        correspondences=filtered_correspondences,
        total_products=len(filtered_products),
        total_columns=len(filtered_column_refs),
        total_correspondences=len(filtered_correspondences),
        column_type_stats=column_type_stats,
        quality_stats=quality_stats
    )
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Set, List
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.matrix.matrix_view_schema import (
    MatrixViewResponse, 
    MatrixColumnRef,
    ProductCorrespondence
)
from app.services.products.detail_service import get_product_details  
from app.services.products.match_service import get_codpro_match_list
from app.utils.identifier_utils import resolve_codpro_list
from app.common.logger import logger
from app.common.redis_client import redis_client
from app.cache.cache_keys import matrix_view_key
import json


async def get_matrix_view_data(payload: ProductIdentifierRequest, db: AsyncSession) -> MatrixViewResponse:
    """
    Récupère les données complètes pour la vue matricielle.
    Inclut le cache Redis.
    """
    logger.info(f"🎯 Matrix view request: {payload}")

    cod_pro_list = await resolve_codpro_list(payload, db)
    if not cod_pro_list:
        logger.warning("❌ Aucun produit trouvé")
        return MatrixViewResponse(
            products=[], column_refs=[], correspondences=[],
            total_products=0, total_columns=0, total_correspondences=0
        )

    redis_key = matrix_view_key(payload)
    try:
        cached = await redis_client.get(redis_key)
        if cached:
            logger.debug(f"✅ Cache hit matrix:view pour {redis_key}")
            return MatrixViewResponse(**json.loads(cached))
    except Exception:
        logger.exception("[Redis] fallback matrix:view")

    # Payload enrichi
    payload.cod_pro_list = cod_pro_list
    products_response = await get_product_details(payload, db)
    products = products_response.products

    matches_response = await get_codpro_match_list(payload, db)
    correspondences = [
        ProductCorrespondence(cod_pro=m.cod_pro, ref_crn=m.ref_crn, ref_ext=m.ref_ext)
        for m in matches_response.matches
    ]

    column_refs = _analyze_column_references(correspondences)

    column_type_stats = {}
    for col in column_refs:
        column_type_stats[col.type] = column_type_stats.get(col.type, 0) + 1

    quality_stats = {}
    for p in products:
        q = p.qualite or "Inconnue"
        quality_stats[q] = quality_stats.get(q, 0) + 1

    response = MatrixViewResponse(
        products=products,
        column_refs=column_refs,
        correspondences=correspondences,
        total_products=len(products),
        total_columns=len(column_refs),
        total_correspondences=len(correspondences),
        column_type_stats=column_type_stats,
        quality_stats=quality_stats
    )

    try:
        await redis_client.set(redis_key, json.dumps(response.model_dump()), ex=3600)
        logger.debug(f"✅ Cache enregistré matrix:view pour {redis_key}")
    except Exception:
        logger.exception("[Redis] set matrix:view")

    return response


def _analyze_column_references(correspondences: List[ProductCorrespondence]) -> List[MatrixColumnRef]:
    ref_crn_set: Set[str] = set()
    ref_ext_set: Set[str] = set()

    for c in correspondences:
        if c.ref_crn: ref_crn_set.add(c.ref_crn)
        if c.ref_ext: ref_ext_set.add(c.ref_ext)

    all_refs = ref_crn_set.union(ref_ext_set)
    column_refs = []

    for ref in sorted(all_refs):
        is_in_crn = ref in ref_crn_set
        is_in_ext = ref in ref_ext_set

        if is_in_crn and is_in_ext:
            ref_type = 'both'
            color_code = '#c8e6c9'
        elif is_in_crn:
            ref_type = 'crn_only'
            color_code = '#bbdefb'
        else:
            ref_type = 'ext_only'
            color_code = '#ffcc80'

        column_refs.append(MatrixColumnRef(ref=ref, type=ref_type, color_code=color_code))

    logger.debug(f"🎨 Colonnes analysées: {len(column_refs)}")
    return column_refs


async def get_matrix_view_filtered(
    payload: ProductIdentifierRequest,
    qualite_filter: str = None,
    famille_filter: int = None,
    statut_filter: int = None,
    search_term: str = None,
    db: AsyncSession = None
) -> MatrixViewResponse:
    """
    Version filtrée de la vue matricielle.
    Pas de cache ici : filtrage dynamique.
    """
    base_response = await get_matrix_view_data(payload, db)
    filtered_products = base_response.products

    if qualite_filter:
        filtered_products = [p for p in filtered_products if p.qualite == qualite_filter]
    if famille_filter is not None:
        filtered_products = [p for p in filtered_products if p.famille == famille_filter]
    if statut_filter is not None:
        filtered_products = [p for p in filtered_products if p.statut == statut_filter]
    if search_term:
        s = search_term.lower()
        filtered_products = [
            p for p in filtered_products if s in (p.refint or '').lower() or s in (p.nom_pro or '').lower()
        ]

    filtered_codpros = {p.cod_pro for p in filtered_products}
    filtered_payload = ProductIdentifierRequest(cod_pro_list=list(filtered_codpros))
    matches_response = await get_codpro_match_list(filtered_payload, db)
    filtered_correspondences = [
        ProductCorrespondence(cod_pro=m.cod_pro, ref_crn=m.ref_crn, ref_ext=m.ref_ext)
        for m in matches_response.matches
    ]

    filtered_column_refs = _analyze_column_references(filtered_correspondences)

    column_type_stats = {}
    for c in filtered_column_refs:
        column_type_stats[c.type] = column_type_stats.get(c.type, 0) + 1

    quality_stats = {}
    for p in filtered_products:
        q = p.qualite or 'Inconnue'
        quality_stats[q] = quality_stats.get(q, 0) + 1

    return MatrixViewResponse(
        products=filtered_products,
        column_refs=filtered_column_refs,
        correspondences=filtered_correspondences,
        total_products=len(filtered_products),
        total_columns=len(filtered_column_refs),
        total_correspondences=len(filtered_correspondences),
        column_type_stats=column_type_stats,
        quality_stats=quality_stats
    )
