from pathlib import Path
from typing import Any, List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Project Metadata
    PROJECT_NAME: str = "autonomous-docx-agent"
    VERSION: str = "0.1.0"

    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    LOG_LEVEL: str = "info"

    # AI API Configurations
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # Document & Storage Configurations
    DOCUMENT_FOLDER: str = "generated_docs"

    # Validation Settings
    VALIDATION_REQUIRED_SECTIONS: str | List[str] = [
        "Executive Summary",
        "Introduction",
        "Timeline",
        "Budget",
        "Conclusion",
    ]

    @field_validator("VALIDATION_REQUIRED_SECTIONS", mode="before")
    @classmethod
    def parse_comma_separated(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            v_stripped = v.strip()
            if v_stripped.startswith("[") and v_stripped.endswith("]"):
                import json
                return json.loads(v_stripped)
            return [item.strip() for item in v_stripped.split(",") if item.strip()]
        return v

    @property
    def document_path(self) -> Path:
        path = Path(self.DOCUMENT_FOLDER)
        path.mkdir(parents=True, exist_ok=True)
        return path


settings = Settings()
