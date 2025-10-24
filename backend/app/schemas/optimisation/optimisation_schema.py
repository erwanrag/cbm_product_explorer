from pydantic import BaseModel, Field
from typing import List, Optional

# ==========================================
# RÉFÉRENCES
# ==========================================
class RefOptimization(BaseModel):
    cod_pro: int
    refint: Optional[str] = None
    px_achat: float
    ca: float
    qte: float
    gain_potentiel_par_ref: Optional[float] = None

# ==========================================
# HISTORIQUE 12 MOIS
# ==========================================
class MoisHistorique(BaseModel):
    periode: str
    qte_reelle: float
    ca_reel: float

    # Marges "achat" (prix d'achat pondéré du groupe vs ref min)
    marge_achat_actuelle: float
    marge_achat_optimisee: float
    gain_manque_achat: float

    # Marges "pmp" (pmp pondéré du groupe vs pmp de la ref retenue, ici ≈ px_min si PMP inconnu)
    marge_pmp_actuelle: float
    marge_pmp_optimisee: float
    gain_manque_pmp: float

    # Pour transparence
    ca_optimise_theorique: float
    facteur_couverture: float

class TotauxHistorique12M(BaseModel):
    qte_totale: float
    ca_reel: float

    marge_achat_actuelle: float
    marge_achat_optimisee: float
    gain_manque_achat: float

    marge_pmp_actuelle: float
    marge_pmp_optimisee: float
    gain_manque_pmp: float

class Historique12M(BaseModel):
    mois: List[MoisHistorique]
    totaux_12m: TotauxHistorique12M

# ==========================================
# PROJECTION 6 MOIS
# ==========================================
class ProjectionMois(BaseModel):
    periode: str
    qte: int
    ca: float

    marge_achat_actuelle: float
    marge_achat_optimisee: float
    gain_potentiel_achat: float

    marge_pmp_actuelle: float
    marge_pmp_optimisee: float
    gain_potentiel_pmp: float

    facteur_couverture: float

class ProjectionTotaux(BaseModel):
    qte: int
    ca: float

    marge_achat_actuelle: float
    marge_achat_optimisee: float
    gain_potentiel_achat: float

    marge_pmp_actuelle: float
    marge_pmp_optimisee: float
    gain_potentiel_pmp: float

class ProjectionMetadata(BaseModel):
    method: str
    model_quality: str
    quality_score: float
    confidence_level: str
    data_points: int
    warnings: List[str] = []
    recommendations: List[str] = []
    summary: str
    evaluation_timestamp: str
    validator_available: bool
    r_squared: Optional[float] = None
    slope: Optional[float] = None
    lower_bound: Optional[List[float]] = None
    upper_bound: Optional[List[float]] = None

class Projection6Mois(BaseModel):
    taux_croissance: float
    mois: List[ProjectionMois]
    totaux: ProjectionTotaux
    metadata: Optional[ProjectionMetadata] = None

# ==========================================
# SYNTHÈSE TOTALE (18M)
# ==========================================
class SyntheseTotale(BaseModel):
    # Historique (12m)
    gain_manque_achat_12m: float
    gain_manque_pmp_12m: float

    # Projection (6m)
    gain_potentiel_achat_6m: float
    gain_potentiel_pmp_6m: float

    # Totaux
    gain_total_achat_18m: float
    gain_total_pmp_18m: float

    # Marges cumulées (actuelle vs optimisée)
    marge_achat_actuelle_18m: float
    marge_achat_optimisee_18m: float
    marge_pmp_actuelle_18m: float
    marge_pmp_optimisee_18m: float

    # Ancien champ (maintien compat)
    amelioration_pct: float

# ==========================================
# ITEM PRINCIPAL
# ==========================================
class GroupOptimization(BaseModel):
    grouping_crn: int
    qualite: str
    refs_total: int
    px_achat_min: float
    px_vente_pondere: float
    taux_croissance: float
    gain_potentiel: float = Field(..., description="Gain immédiat par rationalisation (ancienne métrique)")

    # Nouveaux blocs
    historique_12m: Historique12M
    synthese_totale: SyntheseTotale

    projection_6m: Projection6Mois
    refs_to_keep: List[RefOptimization]
    refs_to_delete_low_sales: List[RefOptimization]
    refs_to_delete_no_sales: List[RefOptimization]

# ==========================================
# RÉPONSE LISTE
# ==========================================
class GroupOptimizationListResponse(BaseModel):
    items: List[GroupOptimization]
