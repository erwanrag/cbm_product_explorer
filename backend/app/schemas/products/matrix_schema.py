from pydantic import BaseModel
from typing import List, Optional

class ProductMatrixResponse(BaseModel):
    groupe_crn: Optional[int]
    cod_pro_list: List[int]
    ref_crn_list: List[str]
    ref_ext_list: List[str]
