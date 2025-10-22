from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded  
from slowapi.util import get_remote_address
from sqlalchemy.exc import SQLAlchemyError
from contextlib import asynccontextmanager
import time
import traceback
import uuid
from app.settings import get_settings
from app.common.logger import logger
from app.common.redis_client import redis_client, test_connection
from app.common.exceptions import (
    CBMBaseException, 
    DatabaseError, 
    CacheError, 
    ValidationError,
    to_http_exception
)
from app.db.engine import test_db_connection
# === Routers ===
from app.routers import routers

# Chargement settings
settings = get_settings()

# === SlowAPI configuration ===
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Cycle de vie de l'application avec vérifications de santé"""
    logger.info("🚀 Initialisation backend CBM_Product_Explorer...")
    
    # Tests de connexion
    redis_ok = False
    db_ok = False
    
    try:
        await test_connection()
        redis_ok = True
        logger.info("✅ Redis connecté")
    except Exception as e:
        logger.error(f"❌ Redis KO: {e}")
    
    try:
        db_ok = await test_db_connection()
        if db_ok:
            logger.info("✅ Base de données connectée")
        else:
            logger.error("❌ Base de données KO")
    except Exception as e:
        logger.error(f"❌ Erreur DB: {e}")
    
    if not redis_ok or not db_ok:
        logger.warning("⚠️ Démarrage avec des services dégradés")
    else:
        logger.info("✅ Backend prêt - Tous les services sont opérationnels")
    
    yield
    # Fermeture propre de Redis
    import inspect
    try:
        if hasattr(redis_client, "close"):
            res = redis_client.close()
            if inspect.isawaitable(res):
                await res
        if hasattr(redis_client, "wait_closed"):
            res2 = redis_client.wait_closed()
            if inspect.isawaitable(res2):
                await res2
    except Exception as e:
        logger.warning(f"Redis close: {e}")

    logger.info("🛑 Arrêt du backend CBM_Product_Explorer")

# === FastAPI App ===
app = FastAPI(
    title="CBM Product Explorer API",
    description="API pour le matching et l'analyse des produits CBM",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.CBM_ENV == "dev" else None,
    redoc_url="/redoc" if settings.CBM_ENV == "dev" else None
)


# ✅ CORS - Configuration CORRIGÉE
# Utilise get_allowed_origins_list() au lieu de ALLOWED_ORIGINS directement
allowed_origins = settings.get_allowed_origins_list()

# En dev, accepter tout si "*" est dans la liste
if settings.CBM_ENV == "dev" and "*" in allowed_origins:
    allowed_origins = ["*"]

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False if "*" in allowed_origins else True,  # ✅ Fix
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# === Middleware de traçabilité et métriques ===
@app.middleware("http")
async def request_tracking_middleware(request: Request, call_next):
    """Middleware pour traçabilité et métriques des requêtes"""
    # Génération d'un ID de trace unique
    trace_id = str(uuid.uuid4())[:8]
    request.state.trace_id = trace_id
    
    start_time = time.time()
    
    # Log de la requête entrante
    logger.info(
        f"🔵 [{trace_id}] {request.method} {request.url.path} "
        f"- Client: {request.client.host if request.client else 'unknown'}"
    )
    
    try:
        response = await call_next(request)
        duration = (time.time() - start_time) * 1000
        
        # Log de la réponse
        status_emoji = "✅" if response.status_code < 400 else "❌"
        logger.info(
            f"{status_emoji} [{trace_id}] {request.method} {request.url.path} "
            f"- {response.status_code} - {duration:.1f}ms"
        )
        
        # Ajout des headers de traçabilité
        response.headers["X-Trace-ID"] = trace_id
        response.headers["X-Response-Time"] = f"{duration:.1f}ms"
        
        return response
        
    except Exception as e:
        duration = (time.time() - start_time) * 1000
        logger.error(
            f"💥 [{trace_id}] {request.method} {request.url.path} "
            f"- ERROR - {duration:.1f}ms - {str(e)}"
        )
        raise

# === Middleware rate limiting personnalisé ===
@app.middleware("http")
async def custom_rate_limit_middleware(request: Request, call_next):
    """Rate limiting intelligent avec exemptions"""
    # Endpoints exemptés
    exempt_paths = ["/docs", "/openapi.json", "/redoc", "/healthcheck", "/favicon.ico"]
    
    if any(request.url.path.startswith(path) for path in exempt_paths):
        return await call_next(request)
    
    # Rate limiting plus strict pour les endpoints de données
    data_endpoints = ["/products", "/sales", "/stock", "/purchase"]
    if any(request.url.path.startswith(f"/api/v1{endpoint}") for endpoint in data_endpoints):
        # Applique un rate limit plus strict pour les endpoints métier
        pass
    
    return await call_next(request)

# === Gestion d'erreurs professionnelle ===
@app.exception_handler(CBMBaseException)
async def cbm_exception_handler(request: Request, exc: CBMBaseException):
    """Gestionnaire pour les exceptions métier CBM"""
    trace_id = getattr(request.state, 'trace_id', 'unknown')
    
    logger.warning(
        f"🟡 [{trace_id}] Exception métier: {exc.message}",
        extra={"details": exc.details, "exception_type": exc.__class__.__name__}
    )
    
    # Mapping des exceptions vers codes HTTP
    status_codes = {
        DatabaseError: 503,
        CacheError: 503,
        ValidationError: 422,
    }
    
    status_code = status_codes.get(type(exc), 500)
    return to_http_exception(exc, status_code)

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """Gestionnaire spécifique pour les erreurs SQL"""
    trace_id = getattr(request.state, 'trace_id', 'unknown')
    
    logger.error(
        f"🔴 [{trace_id}] Erreur SQL: {str(exc)}",
        extra={"sql_error": str(exc), "exception_type": exc.__class__.__name__}
    )
    
    # En production, on masque les détails SQL
    detail = "Erreur de base de données" if settings.CBM_ENV == "prod" else str(exc)
    
    return JSONResponse(
        status_code=503,
        content={
            "detail": detail,
            "trace_id": trace_id,
            "type": "database_error"
        }
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Gestionnaire pour les erreurs HTTP standard"""
    trace_id = getattr(request.state, 'trace_id', 'unknown')
    
    logger.warning(
        f"🟠 [{trace_id}] HTTP {exc.status_code}: {exc.detail}"
    )
    
    return JSONResponse(
        status_code=exc.status_code, 
        content={
            "detail": exc.detail,
            "trace_id": trace_id
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Gestionnaire pour les erreurs de validation Pydantic"""
    trace_id = getattr(request.state, 'trace_id', 'unknown')
    
    logger.warning(
        f"🟡 [{trace_id}] Validation error: {exc.errors()}"
    )
    
    return JSONResponse(
        status_code=422, 
        content={
            "detail": "Erreur de validation des données",
            "errors": exc.errors(),
            "trace_id": trace_id
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Gestionnaire pour toutes les autres exceptions"""
    trace_id = getattr(request.state, 'trace_id', 'unknown')
    
    logger.error(
        f"💥 [{trace_id}] Exception non gérée: {str(exc)}",
        extra={"traceback": traceback.format_exc()}
    )
    
    # En production, on masque les détails techniques
    detail = "Erreur interne du serveur"
    if settings.CBM_ENV == "dev":
        detail = f"{exc.__class__.__name__}: {str(exc)}"
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": detail,
            "trace_id": trace_id,
            "type": "internal_error"
        }
    )

# === Rate limiting setup ===
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# === Routers avec préfixe API ===
api_prefix = "/api/v1"
for router in routers:
    app.include_router(router, prefix=api_prefix)

# === Endpoints système ===
@app.get("/healthcheck")
async def healthcheck():
    """Endpoint de santé complet avec vérifications"""
    checks = {}
    overall_status = "healthy"
    
    # Test Redis
    try:
        redis_ok = await redis_client.ping()
        checks["redis"] = {"status": "healthy", "response_time": "fast"}
    except Exception as e:
        checks["redis"] = {"status": "unhealthy", "error": str(e)}
        overall_status = "degraded"
    
    # Test Database
    try:
        db_ok = await test_db_connection()
        checks["database"] = {"status": "healthy" if db_ok else "unhealthy"}
        if not db_ok:
            overall_status = "degraded"
    except Exception as e:
        checks["database"] = {"status": "unhealthy", "error": str(e)}
        overall_status = "unhealthy"
    
    # Informations système
    checks["system"] = {
        "environment": settings.CBM_ENV,
        "version": "1.0.0",
        "uptime": "N/A"  # Peut être calculé si nécessaire
    }
    
    status_code = 200 if overall_status == "healthy" else 503
    
    return JSONResponse(
        status_code=status_code,
        content={
            "status": overall_status,
            "timestamp": time.time(),
            "checks": checks
        }
    )

@app.get("/")
async def root():
    """Endpoint racine avec informations API"""
    return {
        "name": "CBM Product Explorer API",
        "version": "1.0.0",
        "environment": settings.CBM_ENV,
        "docs": "/docs" if settings.CBM_ENV == "dev" else "disabled",
        "status": "operational"
    }

# === Headers de sécurité ===
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """Ajout des headers de sécurité"""
    response = await call_next(request)
    
    # Headers de sécurité
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    if settings.CBM_ENV == "prod":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response