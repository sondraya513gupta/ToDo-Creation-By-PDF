import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler
from app.core.settings import settings


def setup_logging() -> None:
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    
    # Ensure logs/ directory exists
    log_dir = Path("logs")
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / "app.log"
    
    # Formatter configuration
    formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s (%(filename)s:%(lineno)d): %(message)s"
    )
    
    # Console Stream Handler
    stdout_handler = logging.StreamHandler(sys.stdout)
    stdout_handler.setFormatter(formatter)
    
    # Rotating File Handler (Max size 5MB, keeping 3 backups)
    file_handler = RotatingFileHandler(
        log_file, maxBytes=5 * 1024 * 1024, backupCount=3, encoding="utf-8"
    )
    file_handler.setFormatter(formatter)
    
    # Configure Root Logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Prevent handler accumulation
    root_logger.handlers.clear()
    
    root_logger.addHandler(stdout_handler)
    root_logger.addHandler(file_handler)
    
    logging.info("Logging system initialized. Console and logs/app.log handles mounted.")

