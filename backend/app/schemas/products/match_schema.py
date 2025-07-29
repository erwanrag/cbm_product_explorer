from pydantic import BaseModel
from typing import List, Optional

class ProductMatch(BaseModel):
    cod_pro: int
    ref_crn: Optional[str] = None
    ref_ext: Optional[str] = None

class ProductMatchListResponse(BaseModel):
    matches: List[ProductMatch]
