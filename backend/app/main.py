from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded  
from slowapi.util import get_remote_address
from contextlib import asynccontextmanager
import time
import traceback
from app.settings import get_settings
from app.common.logger import logger
from app.common.redis_client import redis_client, test_connection
from app.db.engine import test_db_connection
# === Routers ===
from app.routers import routers

# Chargement settings
settings = get_settings()

# === SlowAPI configuration ===
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Initialisation backend CBM_GRC_Matcher...")
    await test_connection()
    await test_db_connection()
    logger.info("✅ Backend prêt")
    yield

# === FastAPI App ===
app = FastAPI(lifespan=lifespan)

# === Middlewares ===
app.add_middleware(GZipMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[f"http://{settings.FRONTEND_HOST}:{settings.FRONTEND_PORTS}"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Middleware temps de réponse ===
@app.middleware("http")
async def log_request_duration(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = (time.time() - start) * 1000
    logger.info(f"{request.method} {request.url.path} - {duration:.1f}ms")
    return response

# === Custom rate limiting middleware ===
@app.middleware("http")
async def custom_rate_limit_middleware(request: Request, call_next):
    # Skip rate limiting for documentation endpoints
    exempt_paths = ["/docs", "/openapi.json", "/redoc", "/healthcheck"]
    
    if any(request.url.path.startswith(path) for path in exempt_paths):
        return await call_next(request)
    
    # Apply rate limiting for other endpoints
    return await call_next(request)

# === Gestion erreurs ===
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    logger.warning(f"HTTP error: {exc.detail}")
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.warning(f"Validation error: {exc.errors()}")
    return JSONResponse(status_code=422, content={"detail": exc.errors()})

# === Rate limiting setup ===
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# === Routers ===
for router in routers:
    app.include_router(router)

# === Healthcheck ===
@app.get("/healthcheck")
async def healthcheck():
    redis_ok = await redis_client.ping()
    try:
        await test_db_connection()
        db_ok = True
    except Exception:
        db_ok = False
    return {"redis": redis_ok, "db": db_ok}