from fastapi import Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)


class BaseAgentException(Exception):
    """Base exception for all agent-related failures."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class GeminiServiceError(BaseAgentException):
    """Base exception for Gemini service operations."""
    pass


class GeminiAPIError(GeminiServiceError):
    """Raised when the Gemini API returns errors or fails."""
    pass


class InvalidRequestException(BaseAgentException):
    """Raised when user request validation fails or prompt is invalid (HTTP 400)."""
    pass


class GeminiTimeoutException(BaseAgentException):
    """Raised when communication with Gemini API times out (HTTP 504)."""
    pass


class GeminiFailureException(BaseAgentException):
    """Raised when Gemini API fails to execute or returns errors (HTTP 502)."""
    pass


class DocxGenerationException(BaseAgentException):
    """Raised when document formatting or serialization fails (HTTP 500)."""
    pass


class ValidationFailureException(BaseAgentException):
    """Raised when validation check of generated sections fails (HTTP 422)."""
    pass


def register_exception_handlers(app) -> None:
    """Registers global exception handlers on the FastAPI app."""
    
    @app.exception_handler(InvalidRequestException)
    async def invalid_request_handler(request: Request, exc: InvalidRequestException):
        logger.warning(f"InvalidRequestException: {exc.message}")
        return JSONResponse(
            status_code=400,
            content={"detail": exc.message, "error_type": "InvalidRequest"},
        )

    @app.exception_handler(ValidationFailureException)
    async def validation_failure_handler(request: Request, exc: ValidationFailureException):
        logger.warning(f"ValidationFailureException: {exc.message}")
        return JSONResponse(
            status_code=422,
            content={"detail": exc.message, "error_type": "ValidationFailure"},
        )

    @app.exception_handler(GeminiTimeoutException)
    async def gemini_timeout_handler(request: Request, exc: GeminiTimeoutException):
        logger.error(f"GeminiTimeoutException: {exc.message}")
        return JSONResponse(
            status_code=504,
            content={"detail": exc.message, "error_type": "GeminiTimeout"},
        )

    @app.exception_handler(GeminiFailureException)
    async def gemini_failure_handler(request: Request, exc: GeminiFailureException):
        logger.error(f"GeminiFailureException: {exc.message}")
        return JSONResponse(
            status_code=502,
            content={"detail": exc.message, "error_type": "GeminiFailure"},
        )

    @app.exception_handler(DocxGenerationException)
    async def docx_generation_handler(request: Request, exc: DocxGenerationException):
        logger.error(f"DocxGenerationException: {exc.message}")
        return JSONResponse(
            status_code=500,
            content={"detail": exc.message, "error_type": "DocxGenerationFailure"},
        )

    @app.exception_handler(Exception)
    async def unexpected_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unexpected Exception: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "An unexpected error occurred during execution.", "error_type": "InternalServerError"},
        )
