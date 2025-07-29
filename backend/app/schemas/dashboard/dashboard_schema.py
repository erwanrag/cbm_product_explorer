from pydantic import BaseModel
from typing import List, Optional

from app.schemas.products.detail_schema import ProductDetail
from app.schemas.sales.sales_schema import ProductSalesAggregate, ProductSalesHistory
from app.schemas.stock.stock_schema import ProductStock
from app.schemas.purchase.purchase_schema import ProductPurchasePrice
from app.schemas.products.match_schema import ProductMatch

class DashboardFicheResponse(BaseModel):
    details: List[ProductDetail]
    sales: List[ProductSalesAggregate]
    history: list[ProductSalesHistory] 
    stock: List[ProductStock]
    purchase: List[ProductPurchasePrice]
    matches: List[ProductMatch]  



class DashboardFilterRequest(BaseModel):
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
