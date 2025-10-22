# schemas/stock/stock_schema.py

from pydantic import BaseModel
from typing import List, Optional


class ProductStock(BaseModel):
    cod_pro: int
    depot: int
    stock: float
    pmp: Optional[float] = None

class ProductStockResponse(BaseModel):
    items: List[ProductStock]

# class ProductStockHistory(BaseModel):
#     depot: int
#     cod_pro: int
#     dat_deb: str   # YYYY-MM-DD
#     dat_fin: str   # YYYY-MM-DD
#     stock: float
#     pmp: Optional[float] = None

# class ProductStockHistoryResponse(BaseModel):
#     items: List[ProductStockHistory]

