import hashlib
import json

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

# 📊 Dashboard (GRC : PAS de no_tarif)
def dashboard_kpi_key(cod_pro_list: list[int]) -> str:
    key = ",".join(map(str, sorted(cod_pro_list)))
    return f"dashboard:kpi:{key}"

def dashboard_histo_key(**kwargs) -> str:
    return _hash_if_needed(kwargs, "dashboard:histoprix")

def dashboard_products_key(payload: dict, page: int, limit: int) -> str:
    base = payload.copy()
    base["page"] = page
    base["limit"] = limit
    return _hash_if_needed(base, "dashboard:products")

# 📦 Produit
def produit_key(cod_pro: int) -> str:
    return f"produit:{cod_pro}"

# 🧠 Résolution produits
def resolve_codpro_key(**kwargs) -> str:
    return _hash_if_needed(kwargs, "resolve_codpro")

def groups_key(payload: dict, page: int, limit: int):
    base = json.dumps(payload, sort_keys=True)
    h = hashlib.md5(base.encode()).hexdigest()
    return f"groups:{h}:page{page}:limit{limit}"

def matrice_key(payload: dict, page: int, limit: int):
    base = json.dumps(payload, sort_keys=True)
    h = hashlib.md5(base.encode()).hexdigest()
    return f"matrice:{h}:page{page}:limit{limit}"
