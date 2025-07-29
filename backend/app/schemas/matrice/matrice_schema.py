from pydantic import BaseModel
from typing import Optional, List

class MatriceFilterRequest(BaseModel):
    cod_pro: Optional[int] = None
    ref_crn: Optional[str] = None
    refint: Optional[str] = None
    famille: Optional[str] = None
    qualite: Optional[str] = None
    statut: Optional[str] = None

class MatriceRowOut(BaseModel):
    cod_pro: int
    refint: Optional[str]
    ref_crn: Optional[str]
    famille: Optional[str]
    qualite: Optional[str]
    statut: Optional[str]
    fournisseur: Optional[str]
    # Ajoute tout champ utile (grouping_crn, remarques…)

class MatriceResponse(BaseModel):
    total: int
    rows: List[MatriceRowOut]
