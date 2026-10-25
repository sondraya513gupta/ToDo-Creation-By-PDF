import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from app.api.deps import get_agent_service, get_todo_service
from app.services.agent import AgentService
from app.services.todo_service import TodoService
from app.models.agent import AgentRequest, AgentResponse
from app.models.todo import (
    TodoItem,
    TodoCreate,
    TodoUpdate,
    TodoGenerateRequest,
    TodoListResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/agent",
    response_model=AgentResponse,
    status_code=status.HTTP_200_OK,
    summary="Accept and execute AI Agent requests",
    tags=["AI Agent"],
)
async def run_agent(
    payload: AgentRequest,
    agent_service: AgentService = Depends(get_agent_service),
) -> AgentResponse:
    """
    Submit a natural language request to trigger an autonomous document generation agent.
    """
    logger.info(f"Received incoming agent request: '{payload.request}'")
    response = await agent_service.execute_request(payload.request)
    return response


# ==========================================
# To-Do Management Endpoints
# ==========================================


@router.get(
    "/todos",
    response_model=TodoListResponse,
    summary="Fetch all To-Dos with optional filtering",
    tags=["Todos"],
)
def get_todos(
    category: Optional[str] = Query(None, description="Filter by category"),
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    priority: Optional[str] = Query(None, description="Filter by priority (high, medium, low)"),
    search: Optional[str] = Query(None, description="Search query in title or description"),
    todo_service: TodoService = Depends(get_todo_service),
) -> TodoListResponse:
    return todo_service.get_all(
        category=category, completed=completed, priority=priority, search=search
    )


@router.post(
    "/todos",
    response_model=TodoItem,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new To-Do item",
    tags=["Todos"],
)
def create_todo(
    payload: TodoCreate,
    todo_service: TodoService = Depends(get_todo_service),
) -> TodoItem:
    return todo_service.create(payload)


@router.put(
    "/todos/{todo_id}",
    response_model=TodoItem,
    summary="Update an existing To-Do (status, title, priority, etc.)",
    tags=["Todos"],
)
def update_todo(
    todo_id: str,
    payload: TodoUpdate,
    todo_service: TodoService = Depends(get_todo_service),
) -> TodoItem:
    updated = todo_service.update(todo_id, payload)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with id '{todo_id}' not found.",
        )
    return updated


@router.delete(
    "/todos/{todo_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a To-Do item",
    tags=["Todos"],
)
def delete_todo(
    todo_id: str,
    todo_service: TodoService = Depends(get_todo_service),
):
    success = todo_service.delete(todo_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with id '{todo_id}' not found.",
        )
    return {"status": "success", "message": f"Todo '{todo_id}' deleted successfully."}


@router.post(
    "/todos/generate-ai",
    response_model=List[TodoItem],
    summary="Use AI to automatically break down a goal or prompt into ToDos",
    tags=["Todos"],
)
async def generate_ai_todos(
    payload: TodoGenerateRequest,
    todo_service: TodoService = Depends(get_todo_service),
) -> List[TodoItem]:
    return await todo_service.generate_todos_from_prompt(
        prompt=payload.prompt,
        category=payload.category or "AI Plan",
        priority=payload.priority,
    )


@router.post(
    "/todos/extract-from-pdf",
    response_model=List[TodoItem],
    summary="Upload a PDF file and extract actionable To-Dos using AI",
    tags=["Todos"],
)
async def extract_todos_from_pdf(
    file: UploadFile = File(..., description="The PDF document to extract tasks from"),
    todo_service: TodoService = Depends(get_todo_service),
) -> List[TodoItem]:
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a valid PDF document (.pdf)",
        )
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded PDF file is empty.",
        )
    return await todo_service.extract_todos_from_pdf(
        pdf_bytes=contents, filename=file.filename
    )


