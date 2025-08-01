import hashlib
import json
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest


def _hash_if_needed(obj: dict, prefix: str, max_length: int = 150) -> str:
    json_str = json.dumps(obj, sort_keys=True, default=str)
    if len(json_str) > max_length:
        digest = hashlib.md5(json_str.encode("utf-8")).hexdigest()
        return f"{prefix}:{digest}"
    return f"{prefix}:{json_str}"


def generic_cache_key(prefix: str, **params) -> str:
    json_str = json.dumps(params, sort_keys=True, default=str)
    if len(json_str) > 150:
        digest = hashlib.md5(json_str.encode("utf-8")).hexdigest()
        return f"{prefix}:{digest}"
    return f"{prefix}:{json_str}"


# 🧠 Résolution produits
def resolve_codpro_key(payload: dict) -> str:
    return _hash_if_needed(payload, "resolve_codpro")


# 📊 Dashboard
def dashboard_products_key(payload: ProductIdentifierRequest) -> str:
    return _hash_if_needed(payload.model_dump(exclude_none=True), "dashboard:products")

def dashboard_sales_key(payload: ProductIdentifierRequest) -> str:
    return _hash_if_needed(payload.model_dump(exclude_none=True), "dashboard:sales")

def dashboard_stock_key(payload: ProductIdentifierRequest) -> str:
    return _hash_if_needed(payload.model_dump(exclude_none=True), "dashboard:stock")

def dashboard_purchase_key(payload: ProductIdentifierRequest) -> str:
    return _hash_if_needed(payload.model_dump(exclude_none=True), "dashboard:purchase")

def dashboard_matches_key(payload: ProductIdentifierRequest) -> str:
    return _hash_if_needed(payload.model_dump(exclude_none=True), "dashboard:matches")


# 📦 Produit
def product_details_key(payload: ProductIdentifierRequest) -> str:
    return _hash_if_needed(payload.model_dump(exclude_none=True), "produit:details")


# 📦 Stock
def stock_actuel_key(payload: ProductIdentifierRequest) -> str:
    return _hash_if_needed(payload.model_dump(exclude_none=True), "stock:actuel")

def stock_history_key(payload: ProductIdentifierRequest, first_month: str) -> str:
    base = payload.model_dump(exclude_none=True)
    base["first_month"] = first_month
    return _hash_if_needed(base, "stock:history")


# Purchase
def purchase_price_key(payload: ProductIdentifierRequest) -> str:
    return _hash_if_needed(payload.model_dump(exclude_none=True), "purchase:price")


# 📊 Ventes
def sales_agg_key(payload: ProductIdentifierRequest) -> str:
    return _hash_if_needed(payload.model_dump(exclude_none=True), "sales:agg")

def sales_history_key(payload: ProductIdentifierRequest, min_period: str) -> str:
    base = payload.model_dump(exclude_none=True)
    base["min_period"] = min_period
    return _hash_if_needed(base, "sales:history")


# Matching produits
def match_codpro_key(payload: ProductIdentifierRequest) -> str:
    return _hash_if_needed(payload.model_dump(exclude_none=True), "match:codpro")


# Matrice
def matrix_view_key(payload: ProductIdentifierRequest) -> str:
    return _hash_if_needed(payload.model_dump(exclude_none=True), "matrix:view")

def matrix_filtered_key(payload: dict) -> str:
    serialized = json.dumps(payload, sort_keys=True)
    digest = hashlib.md5(serialized.encode()).hexdigest()
    return f"matrix:filtered:{digest}"


# Optimisation
def optimisation_key(payload: ProductIdentifierRequest) -> str:
    return _hash_if_needed(payload.model_dump(exclude_none=True), "optimisation:group")


# Groupes et matrices paginées
def groups_key(payload: dict, page: int, limit: int):
    base = json.dumps(payload, sort_keys=True)
    h = hashlib.md5(base.encode()).hexdigest()
    return f"groups:{h}:page{page}:limit{limit}"

def matrice_key(payload: dict, page: int, limit: int):
    base = json.dumps(payload, sort_keys=True)
    h = hashlib.md5(base.encode()).hexdigest()
    return f"matrice:{h}:page{page}:limit{limit}"
