# ===================================
# 📁 backend/app/schemas/optimisation/optimisation_schema.py - COMPLET
# ===================================

from pydantic import BaseModel, Field
from typing import List, Optional

class RefOptimization(BaseModel):
    """✅ SCHÉMA INCHANGÉ - référence d'optimisation"""
    cod_pro: int
    refint: Optional[str] = None
    px_achat: float
    ca: float
    qte: float
    gain_potentiel_par_ref: Optional[float] = None

class HistoriqueMois(BaseModel):
    """✅ SCHÉMA INCHANGÉ - mois historique"""
    periode: str
    qte: int
    ca: float
    marge: float

class ProjectionMois(BaseModel):
    """✅ SCHÉMA INCHANGÉ - mois de projection"""
    periode: str
    qte: int
    ca: float
    marge: float

class Projection6Mois(BaseModel):
    """✅ SCHÉMA INCHANGÉ - projection 6 mois (format JSON identique)"""
    taux_croissance: float
    mois: List[ProjectionMois]
    totaux: dict  # {"qte": int, "ca": float, "marge": float}
    metadata: Optional[dict] = None

class GroupOptimization(BaseModel):
    """✅ SCHÉMA INCHANGÉ - groupe d'optimisation (format JSON identique)"""
    grouping_crn: int
    qualite: str
    refs_total: int
    px_achat_min: float
    px_vente_pondere: float
    taux_croissance: float
    gain_potentiel: float = Field(..., description="Gain immédiat par rationalisation")
    gain_potentiel_6m: float = Field(..., description="Gain projeté sur 6 mois")
    historique_6m: List[HistoriqueMois]
    projection_6m: Projection6Mois
    refs_to_keep: List[RefOptimization]
    refs_to_delete_low_sales: List[RefOptimization]
    refs_to_delete_no_sales: List[RefOptimization]

class GroupOptimizationListResponse(BaseModel):
    """✅ SCHÉMA INCHANGÉ - réponse liste des groupes (format JSON identique)"""
    items: List[GroupOptimization]