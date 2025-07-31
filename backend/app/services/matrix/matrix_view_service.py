# backend/app/services/matrix/matrix_view_service.py

from sqlalchemy.ext.asyncio import AsyncSession
from typing import Set, List
from app.common.redis_client import redis_client
from app.cache.cache_keys import resolve_codpro_key
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.matrix.matrix_view_schema import (
    MatrixViewResponse, 
    MatrixProductRow, 
    MatrixColumnRef,
    ProductCorrespondence
)
from app.services.products.detail_service import get_product_details
from app.services.products.match_service import get_codpro_match_list
from app.common.constants import REDIS_TTL_MEDIUM
from app.common.logger import logger
from app.common.payload_utils import is_payload_empty
import json


async def get_matrix_view_data(
    payload: ProductIdentifierRequest, 
    db: AsyncSession
) -> MatrixViewResponse:
    """
    Récupère les données complètes pour la vue matricielle en réutilisant les services existants.
    
    Returns:
        MatrixViewResponse: Structure optimisée pour l'affichage matriciel
    """
    
    if is_payload_empty(payload):
        return MatrixViewResponse(
            products=[], 
            column_refs=[], 
            correspondences=[]
        )

    # ✅ 1. Cache Redis
    redis_key = f"matrix_view:{resolve_codpro_key(**payload.model_dump())}"
    try:
        cached = await redis_client.get(redis_key)
        if cached:
            logger.debug(f"✅ Cache hit matrix view pour {redis_key}")
            return MatrixViewResponse(**json.loads(cached))
    except Exception:
        logger.exception("[Redis] fallback get_matrix_view_data")

    try:
        # ✅ 2. Récupération des détails produits via service existant
        product_details_response = await get_product_details(payload, db)
        products_data = []
        
        for detail in product_details_response.products:  # ✅ CORRECTION: .products au lieu de .details
            products_data.append(MatrixProductRow(
                cod_pro=detail.cod_pro,
                ref_int=detail.refint or f"CBM-{detail.cod_pro}",  # ✅ CORRECTION: refint (pas ref_int)
                designation=detail.nom_pro or 'N/A',  # ✅ CORRECTION: nom_pro (pas designation)
                qualite=detail.qualite or 'N/A',
                stock=0,  # ✅ Le stock n'est pas dans ProductDetail, on met 0 par défaut
                famille=detail.famille,
                statut=detail.statut or 0
            ))

        # ✅ 3. Récupération des correspondances via service existant  
        product_matches_response = await get_codpro_match_list(payload, db)
        correspondences_data = []
        
        for match in product_matches_response.matches:
            correspondences_data.append(ProductCorrespondence(
                cod_pro=match.cod_pro,
                ref_crn=match.ref_crn,
                ref_ext=match.ref_ext
            ))

        # ✅ 4. Analyse des colonnes (union ref_crn + ref_ext)
        column_refs_data = _analyze_column_references(correspondences_data)

        # ✅ 5. Construction réponse
        response = MatrixViewResponse(
            products=products_data,
            column_refs=column_refs_data,
            correspondences=correspondences_data
        )

        # ✅ 6. Cache Redis
        try:
            await redis_client.set(
                redis_key, 
                response.model_dump_json(), 
                ex=REDIS_TTL_MEDIUM
            )
            logger.debug(f"✅ Matrix view cached: {len(products_data)} products, {len(column_refs_data)} columns")
        except Exception:
            logger.exception("[Redis] set failed get_matrix_view_data")

        return response

    except Exception as e:
        logger.error(f"❌ Erreur get_matrix_view_data pour payload={payload}: {e}")
        return MatrixViewResponse(products=[], column_refs=[], correspondences=[])


def _analyze_column_references(correspondences: List[ProductCorrespondence]) -> List[MatrixColumnRef]:
    """
    Analyse les correspondances pour déterminer les colonnes et leur coloration.
    
    Args:
        correspondences: Liste des correspondances produit
        
    Returns:
        List[MatrixColumnRef]: Colonnes avec type et couleur
    """
    
    # Sets pour analyser les références
    ref_crn_set: Set[str] = set()
    ref_ext_set: Set[str] = set()
    
    # Collecte des références non nulles
    for corr in correspondences:
        if corr.ref_crn:
            ref_crn_set.add(corr.ref_crn)
        if corr.ref_ext:
            ref_ext_set.add(corr.ref_ext)
    
    # Union de toutes les références distinctes
    all_refs = ref_crn_set.union(ref_ext_set)
    
    # Analyse du type et attribution couleur
    column_refs = []
    for ref in sorted(all_refs):  # Tri alphabétique
        is_in_crn = ref in ref_crn_set
        is_in_ext = ref in ref_ext_set
        
        if is_in_crn and is_in_ext:
            ref_type = 'both'
            color_code = '#c8e6c9'  # Vert clair - présent dans les 2
        elif is_in_crn:
            ref_type = 'crn_only'  
            color_code = '#bbdefb'  # Bleu clair - uniquement CRN
        else:  # is_in_ext
            ref_type = 'ext_only'
            color_code = '#ffcc80'  # Orange clair - uniquement EXT
            
        column_refs.append(MatrixColumnRef(
            ref=ref,
            type=ref_type,
            color_code=color_code
        ))
    
    logger.debug(f"🎨 Colonnes analysées: {len(column_refs)} refs ({len(ref_crn_set)} CRN, {len(ref_ext_set)} EXT)")
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
    Version filtrée de la vue matricielle avec critères additionnels.
    
    Args:
        payload: Critères de base pour identifier les produits
        qualite_filter: Filtre sur la qualité (OEM, PMQ, etc.)
        famille_filter: Filtre sur la famille produit
        statut_filter: Filtre sur le statut (0=actif, etc.)
        search_term: Terme de recherche dans ref_int ou désignation
        db: Session base de données
        
    Returns:
        MatrixViewResponse: Vue matricielle filtrée
    """
    
    # Pour l'instant, on récupère tout puis on filtre côté Python
    # TODO: Optimiser avec filtres SQL directs si performance critique
    
    base_response = await get_matrix_view_data(payload, db)
    
    # Application des filtres
    filtered_products = base_response.products
    
    if qualite_filter:
        filtered_products = [p for p in filtered_products if p.qualite == qualite_filter]
    
    if famille_filter is not None:
        filtered_products = [p for p in filtered_products if p.famille == famille_filter]
    
    if statut_filter is not None:
        filtered_products = [p for p in filtered_products if p.statut == statut_filter]
    
    if search_term:
        search_lower = search_term.lower()
        filtered_products = [
            p for p in filtered_products 
            if (search_lower in (p.ref_int or '').lower() or 
                search_lower in (p.designation or '').lower())
        ]
    
    # Filtrage des correspondances pour ne garder que les produits filtrés
    filtered_cod_pros = {p.cod_pro for p in filtered_products}
    filtered_correspondences = [
        c for c in base_response.correspondences 
        if c.cod_pro in filtered_cod_pros
    ]
    
    # Recalcul des colonnes si nécessaire
    filtered_column_refs = _analyze_column_references(filtered_correspondences)
    
    return MatrixViewResponse(
        products=filtered_products,
        column_refs=filtered_column_refs,
        correspondences=filtered_correspondences
    )


def _analyze_column_references(correspondences: List[ProductCorrespondence]) -> List[MatrixColumnRef]:
    """
    Analyse les correspondances pour déterminer les colonnes et leur coloration.
    
    Args:
        correspondences: Liste des correspondances produit
        
    Returns:
        List[MatrixColumnRef]: Colonnes avec type et couleur
    """
    
    # Sets pour analyser les références
    ref_crn_set: Set[str] = set()
    ref_ext_set: Set[str] = set()
    
    # Collecte des références non nulles
    for corr in correspondences:
        if corr.ref_crn:
            ref_crn_set.add(corr.ref_crn)
        if corr.ref_ext:
            ref_ext_set.add(corr.ref_ext)
    
    # Union de toutes les références distinctes
    all_refs = ref_crn_set.union(ref_ext_set)
    
    # Analyse du type et attribution couleur
    column_refs = []
    for ref in sorted(all_refs):  # Tri alphabétique
        is_in_crn = ref in ref_crn_set
        is_in_ext = ref in ref_ext_set
        
        if is_in_crn and is_in_ext:
            ref_type = 'both'
            color_code = '#c8e6c9'  # Vert clair - présent dans les 2
        elif is_in_crn:
            ref_type = 'crn_only'  
            color_code = '#bbdefb'  # Bleu clair - uniquement CRN
        else:  # is_in_ext
            ref_type = 'ext_only'
            color_code = '#ffcc80'  # Orange clair - uniquement EXT
            
        column_refs.append(MatrixColumnRef(
            ref=ref,
            type=ref_type,
            color_code=color_code
        ))
    
    logger.debug(f"🎨 Colonnes analysées: {len(column_refs)} refs ({len(ref_crn_set)} CRN, {len(ref_ext_set)} EXT)")
    return column_refs


def _analyze_column_references(correspondences: List[ProductCorrespondence]) -> List[MatrixColumnRef]:
    """
    Analyse les correspondances pour déterminer les colonnes et leur coloration.
    
    Args:
        correspondences: Liste des correspondances produit
        
    Returns:
        List[MatrixColumnRef]: Colonnes avec type et couleur
    """
    
    # Sets pour analyser les références
    ref_crn_set: Set[str] = set()
    ref_ext_set: Set[str] = set()
    
    # Collecte des références non nulles
    for corr in correspondences:
        if corr.ref_crn:
            ref_crn_set.add(corr.ref_crn)
        if corr.ref_ext:
            ref_ext_set.add(corr.ref_ext)
    
    # Union de toutes les références distinctes
    all_refs = ref_crn_set.union(ref_ext_set)
    
    # Analyse du type et attribution couleur
    column_refs = []
    for ref in sorted(all_refs):  # Tri alphabétique
        is_in_crn = ref in ref_crn_set
        is_in_ext = ref in ref_ext_set
        
        if is_in_crn and is_in_ext:
            ref_type = 'both'
            color_code = '#c8e6c9'  # Vert clair - présent dans les 2
        elif is_in_crn:
            ref_type = 'crn_only'  
            color_code = '#bbdefb'  # Bleu clair - uniquement CRN
        else:  # is_in_ext
            ref_type = 'ext_only'
            color_code = '#ffcc80'  # Orange clair - uniquement EXT
            
        column_refs.append(MatrixColumnRef(
            ref=ref,
            type=ref_type,
            color_code=color_code
        ))
    
    logger.debug(f"🎨 Colonnes analysées: {len(column_refs)} refs ({len(ref_crn_set)} CRN, {len(ref_ext_set)} EXT)")
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
    Version filtrée de la vue matricielle avec critères additionnels.
    
    Args:
        payload: Critères de base pour identifier les produits
        qualite_filter: Filtre sur la qualité (OEM, PMQ, etc.)
        famille_filter: Filtre sur la famille produit
        statut_filter: Filtre sur le statut (0=actif, etc.)
        search_term: Terme de recherche dans ref_int ou désignation
        db: Session base de données
        
    Returns:
        MatrixViewResponse: Vue matricielle filtrée
    """
    
    # Pour l'instant, on récupère tout puis on filtre côté Python
    # TODO: Optimiser avec filtres SQL directs si performance critique
    
    base_response = await get_matrix_view_data(payload, db)
    
    # Application des filtres
    filtered_products = base_response.products
    
    if qualite_filter:
        filtered_products = [p for p in filtered_products if p.qualite == qualite_filter]
    
    if famille_filter is not None:
        filtered_products = [p for p in filtered_products if p.famille == famille_filter]
    
    if statut_filter is not None:
        filtered_products = [p for p in filtered_products if p.statut == statut_filter]
    
    if search_term:
        search_lower = search_term.lower()
        filtered_products = [
            p for p in filtered_products 
            if (search_lower in (p.ref_int or '').lower() or 
                search_lower in (p.designation or '').lower())
        ]
    
    # Filtrage des correspondances pour ne garder que les produits filtrés
    filtered_cod_pros = {p.cod_pro for p in filtered_products}
    filtered_correspondences = [
        c for c in base_response.correspondences 
        if c.cod_pro in filtered_cod_pros
    ]
    
    # Recalcul des colonnes si nécessaire
    filtered_column_refs = _analyze_column_references(filtered_correspondences)
    
    return MatrixViewResponse(
        products=filtered_products,
        column_refs=filtered_column_refs,
        correspondences=filtered_correspondences
    )