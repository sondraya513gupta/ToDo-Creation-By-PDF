import datetime
from pathlib import Path


def get_current_timestamp() -> str:
    """
    Returns the current timestamp in ISO format.
    """
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def ensure_directory_exists(directory_path: str | Path) -> Path:
    """
    Ensures a directory exists, creating it if necessary.
    """
    path = Path(directory_path)
    path.mkdir(parents=True, exist_ok=True)
    return path
