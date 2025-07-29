from pydantic import BaseModel
from typing import List, Optional

class ProductSalesHistory(BaseModel):
    cod_pro: int
    refint: Optional[str]
    periode: str      # YYYY-MM
    ca: float
    marge: float
    quantite: float
    marge_percent: float

class ProductSalesHistoryResponse(BaseModel):
    items: List[ProductSalesHistory]

class ProductSalesAggregate(BaseModel):
    cod_pro: int
    refint: Optional[str]
    ca_total: float
    marge_total: float
    quantite_total: float
    marge_percent_total: float

class ProductSalesAggregateResponse(BaseModel):
    items: List[ProductSalesAggregate]
