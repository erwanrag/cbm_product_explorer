from pydantic import BaseModel
from typing import Optional, List

class ProductDetail(BaseModel):
    cod_pro: int
    refint: Optional[str]
    ref_ext: Optional[str]
    famille: Optional[int]
    s_famille: Optional[int]
    qualite: Optional[str]
    statut: Optional[int]
    cod_fou_principal: Optional[int]
    nom_fou: Optional[str]

class ProductDetailResponse(BaseModel):
    products: List[ProductDetail]
