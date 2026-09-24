import logging
from fastapi import APIRouter, Depends, status
from app.api.deps import get_agent_service
from app.services.agent import AgentService
from app.models.agent import AgentRequest, AgentResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/agent",
    response_model=AgentResponse,
    status_code=status.HTTP_200_OK,
    summary="Accept and execute AI Agent requests",
    tags=["AI Agent"],
    responses={
        200: {
            "description": "Successful execution of the planning, content generation, and document compile pipeline.",
            "model": AgentResponse,
        },
        400: {
            "description": "Bad Request - The incoming payload is empty, invalid, or malformed.",
        },
        422: {
            "description": "Unprocessable Entity - Schema validation failed or section requirements could not be met.",
        },
        502: {
            "description": "Bad Gateway - Upstream communication with Gemini Generative API failed.",
        },
        504: {
            "description": "Gateway Timeout - Gemini API request timed out.",
        },
        500: {
            "description": "Internal Server Error - An unexpected exception occurred inside the service pipeline.",
        },
    },
)
async def run_agent(
    payload: AgentRequest,
    agent_service: AgentService = Depends(get_agent_service),
) -> AgentResponse:
    """
    Submit a natural language request to trigger an autonomous document generation agent.

    The execution pipeline runs as follows:
    1. **Planning Phase**: Analyzes the request and uses the LLM to draft a step-by-step numbered execution plan.
    2. **Execution Phase**: Executes the plan sequentially, generating content for each milestone.
    3. **Reflection Phase**: Critiques the generated draft to verify the inclusion of required sections (Executive Summary, Introduction, Timeline, Budget, Conclusion), auto-generating missing elements.
    4. **Compilation Phase**: Renders the complete, verified content into a styled Microsoft Word (.docx) document saved under `generated_docs/`.
    5. **Response Delivery**: Returns the generated content filepath, execution plan steps, logs, and execution status.
    """
    logger.info(f"Received incoming agent request: '{payload.request}'")
    response = await agent_service.execute_request(payload.request)
    return response

