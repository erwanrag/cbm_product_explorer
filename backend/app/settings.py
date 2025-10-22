# backend/app/settings.py
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from functools import lru_cache
from typing import List, Optional
import os
import json


class Settings(BaseSettings):
    """Configuration de l'application CBM Product Explorer"""
    
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
    PROJECT_NAME: str = Field(default="CBM Product Explorer API", description="Nom du projet")
    VERSION: str = Field(default="1.0.0", description="Version de l'API")
    
    # === Sécurité ===
    SECRET_KEY: str = Field(default="CBM_SUPER_SECRET_KEY_256BITS_MINIMUM_LENGTH_REQUIRED_FOR_SECURITY", description="Clé secrète pour JWT")
    ALGORITHM: str = Field(default="HS256", description="Algorithme JWT")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60, ge=1, le=1440, description="Durée validité token")
    
    # === CORS ===
    FRONTEND_HOST: str = Field(default="localhost", description="Host frontend")
    FRONTEND_PORTS: str = Field(default="5181", description="Ports frontend autorisés")
    ALLOWED_ORIGINS: Optional[str] = Field(default=None, description="Origins CORS autorisées (JSON array)")
    
    # === Logging ===
    LOG_LEVEL: str = Field(default="INFO", description="Niveau de log")
    CBM_LOG_DIR: str = Field(default="./logs", description="Répertoire des logs")
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
    
    # === Compatibilité ancienne version ===
    VITE_ENV: Optional[str] = Field(default=None, description="Env pour frontend (legacy)")
    VITE_API_URL: Optional[str] = Field(default=None, description="URL API pour frontend (legacy)")
    
    # Propriété calculée pour ALLOWED_ORIGINS en liste
    _allowed_origins_list: Optional[List[str]] = None
    
    @field_validator('CBM_ENV')
    @classmethod
    def validate_environment(cls, v: str) -> str:
        """Valide l'environnement"""
        if v not in ['dev', 'staging', 'prod']:
            raise ValueError('CBM_ENV doit être dev, staging ou prod')
        return v
    
    @field_validator('DEBUG')
    @classmethod
    def set_debug_from_env(cls, v: bool, info) -> bool:
        """Configure DEBUG automatiquement selon l'environnement"""
        env = info.data.get('CBM_ENV', 'dev')
        return env == 'dev'
    
    @field_validator('LOG_LEVEL')
    @classmethod
    def set_log_level_from_env(cls, v: str, info) -> str:
        """Configure le niveau de log selon l'environnement"""
        env = info.data.get('CBM_ENV', 'dev')
        if env == 'dev':
            return 'DEBUG'
        elif env == 'staging':
            return 'INFO'
        else:  # prod
            return 'WARNING'
    
    @field_validator('SECRET_KEY')
    @classmethod
    def ensure_secret_key_length(cls, v: str) -> str:
        """S'assure que la clé secrète fait au minimum 32 caractères"""
        if not v or len(v) < 32:
            return "CBM_SUPER_SECRET_KEY_256BITS_MINIMUM_LENGTH_REQUIRED_FOR_SECURITY_PURPOSES"
        return v
    
    @field_validator('ALLOWED_ORIGINS')
    @classmethod
    def parse_allowed_origins(cls, v: Optional[str], info) -> Optional[str]:
        """
        Parse et valide ALLOWED_ORIGINS avec gestion d'erreur robuste
        
        Formats acceptés:
        1. JSON array: ["http://localhost:3000","http://localhost:5181"]
        2. Vide/None: génère automatiquement depuis FRONTEND_HOST et FRONTEND_PORTS
        3. String vide: génère automatiquement
        """
        # Si vide ou None, on retourne None (génération auto dans get_allowed_origins_list)
        if not v or v.strip() == "":
            return None
        
        # Tente de parser comme JSON
        try:
            parsed = json.loads(v)
            if isinstance(parsed, list):
                # Valide que ce sont des strings
                if all(isinstance(origin, str) for origin in parsed):
                    return v  # Garde la string JSON originale
                else:
                    raise ValueError("ALLOWED_ORIGINS doit contenir uniquement des strings")
            else:
                raise ValueError("ALLOWED_ORIGINS doit être un array JSON")
        except json.JSONDecodeError as e:
            # Erreur de parsing JSON
            print(f"⚠️ ERREUR ALLOWED_ORIGINS: Format JSON invalide")
            print(f"   Valeur reçue: {v}")
            print(f"   Erreur: {str(e)}")
            print(f"   Format attendu: [\"http://localhost:3000\",\"http://localhost:5181\"]")
            print(f"   OU laisser vide pour génération automatique")
            
            # En mode dev, on continue avec None (génération auto)
            if info.data.get('CBM_ENV') == 'dev':
                print(f"   → Utilisation de la génération automatique (mode dev)")
                return None
            else:
                # En prod, on lève l'erreur
                raise ValueError(
                    f"ALLOWED_ORIGINS invalide: {str(e)}. "
                    f"Format attendu: [\"http://localhost:3000\",\"http://localhost:5181\"]"
                )
    
    def get_allowed_origins_list(self) -> List[str]:
        """
        Retourne la liste des origins autorisées
        Avec cache pour éviter le re-parsing
        """
        if self._allowed_origins_list is not None:
            return self._allowed_origins_list
        
        # Si ALLOWED_ORIGINS est défini, on le parse
        if self.ALLOWED_ORIGINS:
            try:
                self._allowed_origins_list = json.loads(self.ALLOWED_ORIGINS)
                return self._allowed_origins_list
            except json.JSONDecodeError:
                # Fallback sur génération auto
                pass
        
        # Génération automatique depuis FRONTEND_HOST et FRONTEND_PORTS
        origins = []
        host = self.FRONTEND_HOST
        ports = self.FRONTEND_PORTS.split(',')
        
        for port in ports:
            port = port.strip()
            origins.append(f"http://{host}:{port}")
            origins.append(f"https://{host}:{port}")
        
        self._allowed_origins_list = origins
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
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    """Retourne l'instance singleton des settings avec cache"""
    return Settings()


# Instance globale pour faciliter l'import
settings = get_settings()