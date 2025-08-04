from pydantic import BaseModel, Field
from typing import List, Optional

class RefOptimization(BaseModel):
    cod_pro: int
    refint: Optional[str] = None
    px_achat: float
    ca: float
    qte: float
    gain_potentiel_par_ref: Optional[float] = None

class HistoriqueMois(BaseModel):
    periode: str
    qte: int
    ca: float
    marge: float

class ProjectionMois(BaseModel):
    periode: str
    qte: int
    ca: float
    marge_optimisee: float
    marge_actuelle: Optional[float] = None

class ProjectionTotaux(BaseModel):
    qte: int
    ca: float
    marge_optimisee: float
    marge_actuelle: Optional[float] = None

class Projection6Mois(BaseModel):
    taux_croissance: float
    mois: List[ProjectionMois]
    totaux: ProjectionTotaux
    metadata: Optional[dict] = None

class GroupOptimization(BaseModel):
    grouping_crn: int
    qualite: str
    refs_total: int
    px_achat_min: float
    px_vente_pondere: float
    taux_croissance: float
    gain_potentiel: float = Field(..., description="Gain immédiat par rationalisation")
    gain_potentiel_6m: float = Field(..., description="Gain projeté sur 6 mois")
    marge_optimisee_6m: float = Field(..., description="Marge projetée avec rationalisation")
    marge_actuelle_6m: float = Field(..., description="Marge projetée sans rationalisation")
    historique_6m: List[HistoriqueMois]
    projection_6m: Projection6Mois
    refs_to_keep: List[RefOptimization]
    refs_to_delete_low_sales: List[RefOptimization]
    refs_to_delete_no_sales: List[RefOptimization]

class GroupOptimizationListResponse(BaseModel):
    items: List[GroupOptimization]
