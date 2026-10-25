from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.settings import settings
from app.core.logging import setup_logging
from app.api.endpoints import router as api_router

from app.core.exceptions import register_exception_handlers

# Setup application logging
setup_logging()

tags_metadata = [
    {
        "name": "Todos",
        "description": "Endpoints for ToDo task management, AI planning, and PDF extraction.",
    },
    {
        "name": "AI Agent",
        "description": "Endpoints serving the core planning, execution, self-reflection, and DOCX generation pipeline.",
    },
    {
        "name": "Health",
        "description": "System health and status monitoring check.",
    },
]

app = FastAPI(
    title=settings.PROJECT_NAME.replace("-", " ").title(),
    description=(
        "Enterprise-grade FastAPI application serving an autonomous AI Document Generator Agent "
        "and AI-Powered ToDo Management with PDF extraction."
    ),
    version=settings.VERSION,
    openapi_tags=tags_metadata,
)

# Register CORS middleware for React Native mobile & web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register enterprise exception handlers
register_exception_handlers(app)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Service is healthy"}


# Include API routes
app.include_router(api_router)

