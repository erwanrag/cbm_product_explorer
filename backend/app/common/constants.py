# 📄 backend/app/common/constants.py

# === Cache TTL (Time To Live) ===
REDIS_TTL_SHORT = 30      # 30 secondes - pour données très volatiles
REDIS_TTL_MEDIUM = 600    # 10 minutes - pour données normales  
REDIS_TTL_LONG = 86400    # 24 heures - pour données stables

# === Pagination ===
DEFAULT_PAGE_SIZE = 100   # Taille de page par défaut
MAX_PAGE_SIZE = 400       # Taille maximum autorisée
MIN_PAGE_SIZE = 1         # Taille minimum autorisée

# === Limites de performance ===
MAX_CODPRO_LIST_SIZE = 1000  # Maximum de cod_pro dans une requête
MAX_QUERY_TIMEOUT = 30       # Timeout max pour les requêtes SQL (secondes)

# === Qualités produits ===
VALID_QUALITES = {'OEM', 'PMQ', 'PMV', 'OE'}  # Qualités autorisées

# === Codes de statut article ===
STATUT_RAS = 0                    # RAS (normal)
STATUT_INTERDIT_ACHAT = 1        # Interdit Achat
STATUT_INTERDIT_VENTE = 2        # Interdit Vente  
STATUT_INTERDIT_ACHAT_VENTE = 8  # Interdit Achat/Vente

# Statuts considérés comme "actifs" pour les filtres
STATUTS_ACTIFS = {STATUT_RAS}
STATUTS_INTERDITS = {STATUT_INTERDIT_ACHAT, STATUT_INTERDIT_VENTE, STATUT_INTERDIT_ACHAT_VENTE}

# === Formats de date ===
DATE_FORMAT_ISO = "%Y-%m-%d"
DATETIME_FORMAT_ISO = "%Y-%m-%d %H:%M:%S"
MONTH_FORMAT = "%Y-%m"

# === Messages d'validation ===
ERROR_PAYLOAD_EMPTY = "Aucun identifiant produit fourni"
ERROR_CODPRO_NOT_FOUND = "Aucun produit trouvé pour les critères donnés"
ERROR_DATABASE_CONNECTION = "Erreur de connexion à la base de données"
ERROR_REDIS_CONNECTION = "Erreur de connexion au cache Redis"

# === Configuration cache par service ===
CACHE_CONFIG = {
    'identifier': REDIS_TTL_SHORT,   # Résolution rapide
    'product_details': REDIS_TTL_MEDIUM,  # Détails produits
    'sales_history': REDIS_TTL_MEDIUM,    # Historique ventes  
    'stock_data': REDIS_TTL_SHORT,        # Stock très volatile
    'purchase_prices': REDIS_TTL_LONG,    # Prix d'achat stables
    'matrix_data': REDIS_TTL_MEDIUM,      # Données de matrice
}

# === Environnements ===
ENVIRONMENT_DEV = "dev"
ENVIRONMENT_STAGING = "staging" 
ENVIRONMENT_PROD = "prod"

VALID_ENVIRONMENTS = {ENVIRONMENT_DEV, ENVIRONMENT_STAGING, ENVIRONMENT_PROD}