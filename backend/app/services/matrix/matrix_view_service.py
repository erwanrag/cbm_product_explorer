# ===================================
# 📁 backend/app/services/matrix/matrix_view_service.py - CORRECTION
# ===================================

from sqlalchemy.ext.asyncio import AsyncSession
from typing import Set, List
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.matrix.matrix_view_schema import (
    MatrixViewResponse, 
    MatrixColumnRef,
    ProductCorrespondence
)
from app.services.identifiers.identifier_service import get_codpro_list_from_identifier
from app.services.products.detail_service import get_product_details  
from app.services.products.match_service import get_codpro_match_list
from app.common.logger import logger


async def get_matrix_view_data(payload: ProductIdentifierRequest, db: AsyncSession) -> MatrixViewResponse:
    """
    Récupère les données complètes pour la vue matricielle.
    VERSION DEBUG pour identifier le problème.
    """
    logger.info(f"🎯 Matrix view request: {payload}")
    
    # 1. Résolution des codes produits (EXISTANT - ne pas toucher)
    codpro_result = await get_codpro_list_from_identifier(payload, db)
    codpro_list = codpro_result.cod_pro_list
    
    logger.info(f"🔍 Codes produits résolus: {codpro_list}")
    
    if not codpro_list:
        logger.warning("❌ Aucun produit trouvé")
        return MatrixViewResponse(
            products=[],
            column_refs=[],
            correspondences=[],
            total_products=0,
            total_columns=0,
            total_correspondences=0
        )
    
    # 2. Récupération des détails produits
    logger.info(f"🔍 Création payload pour get_product_details avec cod_pro_list: {codpro_list}")
    product_payload = payload
    product_payload.cod_pro_list = codpro_list
    logger.info(f"🔍 Product payload créé: {product_payload}")
    
    products_response = await get_product_details(product_payload, db)
    products = products_response.products
    
    logger.info(f"🔍 Produits récupérés: {len(products)} éléments")
    if len(products) == 0:
        logger.warning("❌ PROBLÈME: get_product_details a retourné 0 produits")
        logger.warning(f"❌ Payload utilisé: {product_payload}")
        logger.warning(f"❌ cod_pro_list original: {codpro_list}")
    
    # 3. Récupération des correspondances
    logger.info(f"🔍 Récupération correspondances pour {len(codpro_list)} produits")
    matches_response = await get_codpro_match_list(product_payload, db)
    
    logger.info(f"🔍 Matches récupérés: {len(matches_response.matches)} éléments")
    
    # Conversion des ProductMatch vers ProductCorrespondence pour la matrice
    correspondences = []
    for match in matches_response.matches:
        correspondences.append(ProductCorrespondence(
            cod_pro=match.cod_pro,
            ref_crn=match.ref_crn,
            ref_ext=match.ref_ext
        ))
    
    logger.info(f"🔍 Correspondances converties: {len(correspondences)} éléments")
    
    # 4. Analyse des colonnes (EXISTANT)
    column_refs = _analyze_column_references(correspondences)
    
    logger.info(f"🔍 Colonnes analysées: {len(column_refs)} éléments")
    
    # 5. Calcul des statistiques
    column_type_stats = {}
    for col in column_refs:
        column_type_stats[col.type] = column_type_stats.get(col.type, 0) + 1
    
    quality_stats = {}
    for product in products:
        qual = product.qualite or 'Inconnue'
        quality_stats[qual] = quality_stats.get(qual, 0) + 1
    
    logger.info(f"✅ Matrix view FINAL: {len(products)} produits, {len(column_refs)} colonnes, {len(correspondences)} correspondances")
    
    return MatrixViewResponse(
        products=products,  # MAINTENANT ProductDetail complet !
        column_refs=column_refs,
        correspondences=correspondences,
        total_products=len(products),
        total_columns=len(column_refs),
        total_correspondences=len(correspondences),
        column_type_stats=column_type_stats,
        quality_stats=quality_stats
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
    """
    
    # Pour l'instant, on récupère tout puis on filtre côté Python
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
            if (search_lower in (p.refint or '').lower() or 
                search_lower in (p.nom_pro or '').lower())
        ]
    
    # Filtrage des correspondances pour ne garder que les produits filtrés
    filtered_cod_pros = {p.cod_pro for p in filtered_products}
    
    # Récupération des correspondances pour les produits filtrés
    filtered_payload = ProductIdentifierRequest(cod_pro_list=list(filtered_cod_pros))
    matches_response = await get_codpro_match_list(filtered_payload, db)
    
    # Conversion vers ProductCorrespondence
    filtered_correspondences = []
    for match in matches_response.matches:
        filtered_correspondences.append(ProductCorrespondence(
            cod_pro=match.cod_pro,
            ref_crn=match.ref_crn,
            ref_ext=match.ref_ext
        ))
    
    # Recalcul des colonnes si nécessaire
    filtered_column_refs = _analyze_column_references(filtered_correspondences)
    
    # Ajout des statistiques
    column_type_stats = {}
    for col in filtered_column_refs:
        column_type_stats[col.type] = column_type_stats.get(col.type, 0) + 1
    
    quality_stats = {}
    for product in filtered_products:
        qual = product.qualite or 'Inconnue'
        quality_stats[qual] = quality_stats.get(qual, 0) + 1
    
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