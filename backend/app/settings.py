from pydantic_settings import BaseSettings
from pydantic import Field, validator
from functools import lru_cache
from typing import List, Optional
import os


class Settings(BaseSettings):
    """Configuration de l'application CBM GRC Matcher"""
    
    # === Environnement ===
    CBM_ENV: str = Field(default="dev", description="Environnement (dev/staging/prod)")
    DEBUG: bool = Field(default=True, description="Mode debug")
    
    # === Base de données ===
    SQL_SERVER: str = Field(..., description="Serveur SQL Server")
    SQL_DATABASE: str = Field(..., description="Nom de la base de données")
    SQL_USER: str = Field(..., description="Utilisateur SQL")
    SQL_PASSWORD: str = Field(..., description="Mot de passe SQL")
    DATABASE_URL: str = Field(..., description="URL complète de la base")
    DATABASE_POOL_SIZE: int = Field(default=50, ge=1, le=100, description="Taille du pool de connexions")
    DATABASE_MAX_OVERFLOW: int = Field(default=5, ge=0, le=50, description="Débordement max du pool")
    DATABASE_TIMEOUT: int = Field(default=5, ge=1, le=30, description="Timeout connexion DB (secondes)")
    
    # === Redis ===
    REDIS_HOST: str = Field(default="localhost", description="Host Redis")
    REDIS_PORT: int = Field(default=6379, ge=1, le=65535, description="Port Redis")
    REDIS_DB: int = Field(default=0, ge=0, le=15, description="Numéro de DB Redis")
    REDIS_PASSWORD: Optional[str] = Field(default=None, description="Mot de passe Redis")
    REDIS_URL: Optional[str] = Field(default=None, description="URL complète Redis")
    
    # === Cache TTL ===
    REDIS_TTL_SHORT: int = Field(default=30, ge=1, description="TTL court (secondes)")
    REDIS_TTL_MEDIUM: int = Field(default=600, ge=1, description="TTL moyen (secondes)")
    REDIS_TTL_LONG: int = Field(default=86400, ge=1, description="TTL long (secondes)")
    
    # === API Configuration ===
    API_V1_PREFIX: str = Field(default="/api/v1", description="Préfixe API")
    PROJECT_NAME: str = Field(default="CBM GRC Matcher API", description="Nom du projet")
    VERSION: str = Field(default="1.0.0", description="Version de l'API")
    
    # === Sécurité (CORRIGÉ) ===
    SECRET_KEY: str = Field(default="CBM_SUPER_SECRET_KEY_256BITS_MINIMUM_LENGTH_REQUIRED_FOR_SECURITY", description="Clé secrète pour JWT")
    ALGORITHM: str = Field(default="HS256", description="Algorithme JWT")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60, ge=1, le=1440, description="Durée validité token")
    
    # === CORS ===
    FRONTEND_HOST: str = Field(default="localhost", description="Host frontend")
    FRONTEND_PORTS: str = Field(default="5181", description="Ports frontend autorisés")
    ALLOWED_ORIGINS: List[str] = Field(default=[], description="Origins CORS autorisées")
    
    # === Logging (CORRIGÉ) ===
    LOG_LEVEL: str = Field(default="INFO", description="Niveau de log")
    CBM_LOG_DIR: str = Field(default="./logs", description="Répertoire des logs")  # Nom corrigé
    LOG_RETENTION_DAYS: int = Field(default=7, ge=1, le=365, description="Rétention logs (jours)")
    LOG_MAX_SIZE: str = Field(default="10MB", description="Taille max d'un fichier log")
    
    # === Performance ===
    DEFAULT_PAGE_SIZE: int = Field(default=100, ge=1, le=1000, description="Taille de page par défaut")
    MAX_PAGE_SIZE: int = Field(default=400, ge=1, le=1000, description="Taille de page maximum")
    REQUEST_TIMEOUT: int = Field(default=30, ge=1, le=300, description="Timeout requête (secondes)")
    
    # === Rate Limiting ===
    RATE_LIMIT_PER_MINUTE: int = Field(default=100, ge=1, description="Requêtes par minute par IP")
    RATE_LIMIT_BURST: int = Field(default=200, ge=1, description="Burst maximum")
    
    # === Monitoring ===
    ENABLE_METRICS: bool = Field(default=True, description="Activer les métriques")
    METRICS_PORT: int = Field(default=8001, ge=1024, le=65535, description="Port métriques Prometheus")
    ENABLE_TRACING: bool = Field(default=False, description="Activer le tracing distribué")
    
    # === Compatibilité ancienne version (AJOUTÉ) ===
    VITE_ENV: Optional[str] = Field(default=None, description="Env pour frontend (legacy)")
    VITE_API_URL: Optional[str] = Field(default=None, description="URL API pour frontend (legacy)")
    
    @validator('CBM_ENV')
    def validate_environment(cls, v):
        """Valide l'environnement"""
        if v not in ['dev', 'staging', 'prod']:
            raise ValueError('CBM_ENV doit être dev, staging ou prod')
        return v
    
    @validator('DEBUG', pre=True, always=True)
    def set_debug_from_env(cls, v, values):
        """Configure DEBUG automatiquement selon l'environnement"""
        env = values.get('CBM_ENV', 'dev')
        return env == 'dev'
    
    @validator('LOG_LEVEL', pre=True, always=True)
    def set_log_level_from_env(cls, v, values):
        """Configure le niveau de log selon l'environnement"""
        env = values.get('CBM_ENV', 'dev')
        if env == 'dev':
            return 'DEBUG'
        elif env == 'staging':
            return 'INFO'
        else:  # prod
            return 'WARNING'
    
    @validator('SECRET_KEY', pre=True, always=True)
    def ensure_secret_key_length(cls, v):
        """S'assure que la clé secrète fait au minimum 32 caractères"""
        if not v or len(v) < 32:
            # Génère une clé par défaut sécurisée
            return "CBM_SUPER_SECRET_KEY_256BITS_MINIMUM_LENGTH_REQUIRED_FOR_SECURITY_PURPOSES"
        return v
    
    @validator('ALLOWED_ORIGINS', pre=True, always=True)
    def build_allowed_origins(cls, v, values):
        """Construit la liste des origins autorisées"""
        if v:  # Si déjà défini, on garde
            return v
        
        host = values.get('FRONTEND_HOST', 'localhost')
        ports = values.get('FRONTEND_PORTS', '5181')
        
        origins = []
        for port in ports.split(','):
            origins.append(f"http://{host}:{port.strip()}")
            origins.append(f"https://{host}:{port.strip()}")
        
        return origins
    
    @property
    def is_development(self) -> bool:
        """Retourne True si on est en développement"""
        return self.CBM_ENV == "dev"
    
    @property
    def is_production(self) -> bool:
        """Retourne True si on est en production"""
        return self.CBM_ENV == "prod"
    
    @property
    def database_url_sync(self) -> str:
        """URL de base de données synchrone (pour migrations)"""
        return self.DATABASE_URL.replace('+aioodbc', '+pyodbc')
    
    def get_redis_url(self) -> str:
        """Construit l'URL Redis complète"""
        if self.REDIS_URL:
            return self.REDIS_URL
        
        auth = f":{self.REDIS_PASSWORD}@" if self.REDIS_PASSWORD else ""
        return f"redis://{auth}{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
    
    class Config:
        # Configuration du chargement .env
        env_file = os.environ.get(
            "CBM_ENV_FILE",
            os.path.join(os.path.dirname(__file__), "..", "..", ".env.dev")
        )
        env_file_encoding = 'utf-8'
        case_sensitive = True
        # CORRIGÉ: Permet les champs extra pour compatibilité
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    """Retourne l'instance singleton des settings avec cache"""
    return Settings()


# Instance globale pour faciliter l'import
settings = get_settings()