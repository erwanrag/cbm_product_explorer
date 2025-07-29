from pydantic import BaseModel
from typing import Optional, List

class GroupsFilterRequest(BaseModel):
    ref_crn: Optional[str] = None
    famille: Optional[str] = None
    qualite: Optional[str] = None
    statut: Optional[str] = None

class GroupOut(BaseModel):
    grouping_crn: str                # ou le champ qui te sert de clé de regroupement
    nb_produits: int
    familles: Optional[str]          # concat/familles du groupe
    qualite: Optional[str]
    fournisseur: Optional[str]
    statut: Optional[str]
    qte_totale: Optional[float]      # sur 12 mois, par ex
    ca_total: Optional[float]
    marge_total: Optional[float]

class GroupsResponse(BaseModel):
    total: int
    rows: List[GroupOut]
