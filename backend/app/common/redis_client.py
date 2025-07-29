# app/common/redis_client.py
from redis.asyncio import Redis
from app.settings import get_settings
from app.common.logger import logger

_settings = get_settings()
redis_client = Redis(
    host=_settings.REDIS_HOST,
    port=_settings.REDIS_PORT,
    db=_settings.REDIS_DB,
    socket_timeout=5,
    socket_connect_timeout=5,
    retry_on_timeout=True
)

async def test_connection():
    try:
        await redis_client.ping()
        logger.info("✅ Redis OK")
    except Exception:
        logger.exception("❌ Redis KO")
