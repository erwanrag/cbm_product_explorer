from pydantic import BaseModel, Field
from typing import Optional, List


class ProductIdentifierRequest(BaseModel):
    """
    Requête de résolution produit à partir d'un ou plusieurs identifiants (ref_crn, ref_ext, refint, cod_pro…)
    """
    cod_pro: Optional[int] = Field(None, description="Code produit CBM (interne)")
    ref_crn: Optional[str] = Field(None, description="Référence constructeur")
    refint: Optional[str] = Field(None, description="Référence interne CBM")
    ref_ext: Optional[str] = Field(None, description="Référence externe client / GRC")
    
    cod_pro_list: Optional[List[int]] = Field(default_factory=list, description="Liste cod_pro déjà connue (non utilisée ici)")
    
    famille: Optional[int] = Field(None, description="Famille produit (non utilisé ici)")
    s_famille: Optional[int] = Field(None, description="Sous-famille produit (non utilisé ici)")
    
    qualite: Optional[str] = Field(None, description="Filtre qualité (OE, OEM, PMQ, PMV)")
    statut: Optional[int] = Field(None, description="Statut produit (conservé pour usage futur)")
    statut_clean: Optional[str] = Field(None, description="Statut nettoyé (non utilisé ici)")
    
    grouping_crn: Optional[int] = Field(0, description="1 = activer regroupement par grouping_crn")
    single_cod_pro: Optional[bool] = Field(False, description="True = ne retourner qu’un seul cod_pro (le premier)")



class CodProListResponse(BaseModel):
    """
    Liste des cod_pro résolus à partir des identifiants fournis.
    """
    cod_pro_list: List[int] = Field(..., description="Liste de codes produits résolus")
