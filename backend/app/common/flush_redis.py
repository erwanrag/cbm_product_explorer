import sys
import os

# Ajoute automatiquement la racine backend au PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.common.redis_client import redis_client
import asyncio

async def flush_redis():
    print("Flushing all Redis keys...")
    await redis_client.flushall()
    print("✅ Redis vidé avec succès !")

if __name__ == "__main__":
    asyncio.run(flush_redis())
