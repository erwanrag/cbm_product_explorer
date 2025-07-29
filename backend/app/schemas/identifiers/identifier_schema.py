from pydantic import BaseModel
from typing import Optional, List

class ProductIdentifierRequest(BaseModel):
    cod_pro: Optional[int] = None
    ref_crn: Optional[str] = None
    refint: Optional[str] = None
    ref_ext: Optional[str] = None
    cod_pro_list: Optional[List[int]] = []
    famille: Optional[int] = None
    s_famille: Optional[int] = None
    qualite: Optional[str] = None
    statut: Optional[int] = None
    statut_clean: Optional[str] = None
    grouping_crn: Optional[int] = 0

class CodProListResponse(BaseModel):
    cod_pro_list: List[int]