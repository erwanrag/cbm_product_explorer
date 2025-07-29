# 📁 app/schemas/optimisation/optimisation_schema.py
from pydantic import BaseModel
from typing import List, Optional


class RefOptimization(BaseModel):
    cod_pro: int
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
    marge: float


class Projection6Mois(BaseModel):
    taux_croissance: float
    mois: List[ProjectionMois]
    totaux: dict


class GroupOptimization(BaseModel):
    grouping_crn: int
    qualite: str
    refs_total: int
    px_achat_min: float
    px_vente_pondere: float
    taux_croissance: float
    gain_potentiel: float
    gain_potentiel_6m: float
    historique_6m: List[HistoriqueMois]
    projection_6m: Projection6Mois
    refs_to_keep: List[RefOptimization]
    refs_to_delete_low_sales: List[RefOptimization]
    refs_to_delete_no_sales: List[RefOptimization]


class GroupOptimizationListResponse(BaseModel):
    items: List[GroupOptimization]
