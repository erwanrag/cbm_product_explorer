# backend/app/schemas/matrix/matrix_view_schema.py

from pydantic import BaseModel, Field
from typing import List, Optional


class MatrixProductRow(BaseModel):
    """
    Représente une ligne de la matrice (un produit avec ses détails).
    """
    cod_pro: int = Field(..., description="Code produit unique")
    ref_int: str = Field(..., description="Référence interne CBM")
    designation: str = Field(..., description="Désignation du produit")
    qualite: str = Field(..., description="Qualité (OEM, PMQ, PMV, OE)")
    stock: Optional[int] = Field(default=0, description="Stock disponible")
    famille: Optional[int] = Field(default=None, description="Code famille produit")
    statut: Optional[int] = Field(default=0, description="Statut produit (0=actif)")


class MatrixColumnRef(BaseModel):
    """
    Représente une colonne de la matrice (référence CRN ou EXT).
    """
    ref: str = Field(..., description="Référence (CRN ou EXT)")
    type: str = Field(..., description="Type: 'crn_only', 'ext_only', 'both'")
    color_code: str = Field(..., description="Code couleur hexadécimal pour l'affichage")
    
    class Config:
        json_schema_extra = {
            "example": {
                "ref": "ATS52460",
                "type": "crn_only", 
                "color_code": "#bbdefb"
            }
        }


class ProductCorrespondence(BaseModel):
    """
    Représente une correspondance produit-référence (données de croisement).
    """
    cod_pro: int = Field(..., description="Code produit")
    ref_crn: Optional[str] = Field(None, description="Référence constructeur")
    ref_ext: Optional[str] = Field(None, description="Référence externe/GRC")


class MatrixViewResponse(BaseModel):
    """
    Réponse complète pour la vue matricielle.
    """
    products: List[MatrixProductRow] = Field(
        default_factory=list, 
        description="Produits (lignes de la matrice)"
    )
    column_refs: List[MatrixColumnRef] = Field(
        default_factory=list,
        description="Références colonnes avec coloration"
    )
    correspondences: List[ProductCorrespondence] = Field(
        default_factory=list,
        description="Correspondances pour le croisement"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "products": [
                    {
                        "cod_pro": 15161,
                        "ref_int": "CBM-15161-OEM", 
                        "designation": "Joint de culasse",
                        "qualite": "OEM",
                        "stock": 45,
                        "famille": 123,
                        "statut": 0
                    }
                ],
                "column_refs": [
                    {
                        "ref": "ATS52460",
                        "type": "crn_only",
                        "color_code": "#bbdefb"
                    },
                    {
                        "ref": "09.B325.30", 
                        "type": "both",
                        "color_code": "#c8e6c9"
                    }
                ],
                "correspondences": [
                    {
                        "cod_pro": 15161,
                        "ref_crn": "ATS52460",
                        "ref_ext": None
                    },
                    {
                        "cod_pro": 15161,
                        "ref_crn": "ATS52460", 
                        "ref_ext": "09.B325.30"
                    }
                ]
            }
        }


class MatrixViewFilterRequest(BaseModel):
    """
    Filtres additionnels pour la vue matricielle.
    """
    qualite: Optional[str] = Field(None, description="Filtre qualité (OEM, PMQ, PMV, OE)")
    famille: Optional[int] = Field(None, description="Filtre famille produit")
    statut: Optional[int] = Field(None, description="Filtre statut (0=actif, 1=interdit achat, etc.)")
    search_term: Optional[str] = Field(None, description="Recherche dans ref_int ou désignation")
    
    class Config:
        json_schema_extra = {
            "example": {
                "qualite": "OEM",
                "famille": 123,
                "statut": 0,
                "search_term": "joint"
            }
        }


class MatrixCellData(BaseModel):
    """
    Données d'une cellule de la matrice pour les interactions frontend.
    """
    cod_pro: int = Field(..., description="Code produit")
    ref: str = Field(..., description="Référence colonne")
    has_correspondence: bool = Field(..., description="Vraie si correspondance existe")
    ref_crn_match: Optional[str] = Field(None, description="Ref CRN si match")
    ref_ext_match: Optional[str] = Field(None, description="Ref EXT si match")
    match_type: str = Field(..., description="Type de match: 'crn', 'ext', 'both', 'none'")
    
    class Config:
        json_schema_extra = {
            "example": {
                "cod_pro": 15161,
                "ref": "ATS52460",
                "has_correspondence": True,
                "ref_crn_match": "ATS52460",
                "ref_ext_match": None,
                "match_type": "crn"
            }
        }


class MatrixExportRequest(BaseModel):
    """
    Paramètres pour l'export de la matrice.
    """
    format: str = Field("csv", description="Format d'export: 'csv', 'xlsx'")
    include_empty_cells: bool = Field(True, description="Inclure les cellules vides")
    include_product_details: bool = Field(True, description="Inclure détails produits")
    
    class Config:
        json_schema_extra = {
            "example": {
                "format": "xlsx",
                "include_empty_cells": False,
                "include_product_details": True
            }
        }