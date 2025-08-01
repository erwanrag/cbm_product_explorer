# ===================================
# 📁 backend/app/schemas/matrix/matrix_view_schema.py - VERSION SIMPLE
# ===================================

from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.products.detail_schema import ProductDetail  # UTILISER L'EXISTANT

class MatrixColumnRef(BaseModel):
    """
    Référence de colonne dans la matrice avec son type et couleur
    """
    ref: str = Field(..., description="Référence (CRN ou EXT)")
    type: str = Field(..., description="Type: 'crn_only', 'ext_only', 'both'")
    color_code: str = Field(..., description="Code couleur pour l'affichage")
    
class ProductCorrespondence(BaseModel):
    """
    Correspondance entre un produit et des références
    """
    cod_pro: int = Field(..., description="Code produit")
    ref_crn: Optional[str] = Field(None, description="Référence constructeur")
    ref_ext: Optional[str] = Field(None, description="Référence externe")

class MatrixViewResponse(BaseModel):
    """
    Réponse complète pour la vue matricielle.
    UTILISE ProductDetail existant directement.
    """
    products: List[ProductDetail] = Field(..., description="Liste des produits avec détails complets")
    column_refs: List[MatrixColumnRef] = Field(..., description="Références colonnes avec types et couleurs")
    correspondences: List[ProductCorrespondence] = Field(..., description="Correspondances produit-référence")
    
    # Métadonnées
    total_products: int = Field(..., description="Nombre total de produits")
    total_columns: int = Field(..., description="Nombre total de colonnes")
    total_correspondences: int = Field(..., description="Nombre total de correspondances")
    
    # Statistiques par type
    column_type_stats: dict = Field(default_factory=dict, description="Répartition des colonnes par type")
    quality_stats: dict = Field(default_factory=dict, description="Répartition par qualité")

# Filtres pour les endpoints qui en auraient besoin
class MatrixViewFilterRequest(BaseModel):
    """
    Filtres additionnels pour la vue matricielle
    """
    qualite: Optional[str] = Field(None, description="Filtre par qualité (OEM, PMQ, PMV, OE)")
    famille: Optional[int] = Field(None, description="Filtre par famille produit")
    statut: Optional[int] = Field(None, description="Filtre par statut produit")
    search_term: Optional[str] = Field(None, description="Recherche textuelle libre")