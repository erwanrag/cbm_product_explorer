from loguru import logger
import os
import sys

ENV = os.getenv("CBM_ENV", "dev")
LOG_LEVEL = "DEBUG" if ENV == "dev" else "INFO"

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
log_dir = os.path.join(base_dir, os.getenv("CBM_LOG_DIR", "logs"))
os.makedirs(log_dir, exist_ok=True)

log_file_path = os.path.join(log_dir, "cbm_api.log")

logger.remove()

if ENV == "dev":
    # Console ultra-riche (couleur, traceback complet, diagnose, tout)
    logger.add(
        sys.stdout,
        level=LOG_LEVEL,
        format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{name}:{function}:{line}</cyan> - <level>{message}</level>",
        colorize=True,
        backtrace=True,
        diagnose=True,
        enqueue=True,
    )
else:
    # Console sobre en prod
    logger.add(
        sys.stdout,
        level=LOG_LEVEL,
        format="{time} | {level} | {message}",
        colorize=False,
        enqueue=True,
    )

# Fichier toujours en JSONL, rotation, retention
logger.add(
    log_file_path,
    level=LOG_LEVEL,
    serialize=True,
    rotation="10 MB",
    retention="7 days",
    enqueue=True,
    backtrace=True,
    diagnose=True,
)
