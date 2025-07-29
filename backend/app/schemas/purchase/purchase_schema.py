from pydantic import BaseModel
from typing import List, Optional

class ProductPurchasePrice(BaseModel):
    cod_pro: int
    px_achat_eur: Optional[float] = None

class ProductPurchasePriceResponse(BaseModel):
    items: List[ProductPurchasePrice]
