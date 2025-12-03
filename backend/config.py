from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


class Settings(BaseSettings):
    MONGO_URI: str
    MONGO_DB: str = "todobaratisimo"
    MONGO_DB_USERS: str = "todobaratisimo_users"
    # Incluye puertos comunes de Vite (5173/5174) por defecto
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5178",
    ]
    GOOGLE_CLOUD_PROJECT: str = ""
    GOOGLE_CLOUD_LOCATION: str = "us-central1"
    GEMINI_MODEL: str = "gemini-2.0-flash-001"
    # Permite desactivar completamente la IA para evitar respuestas por defecto
    AI_DISABLED: bool = False
    # Si es True, el endpoint de IA requiere Vertex AI configurado y responde 503 si no lo está.
    # Si es False, el endpoint devolverá una respuesta fallback simple basada en heurísticas locales.
    AI_REQUIRE_VERTEX: bool = True
    ADMIN_EMAIL: str = ""
    ADMIN_PASSWORD: str = ""

    # Pydantic v2 settings config
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).parent / ".env"),
        extra="ignore",
    )


settings = Settings()
