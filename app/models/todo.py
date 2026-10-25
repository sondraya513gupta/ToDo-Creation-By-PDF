from enum import Enum
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class TodoPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TodoSource(str, Enum):
    MANUAL = "manual"
    AI_PLAN = "ai_plan"
    PDF_EXTRACT = "pdf_extract"


class TodoItem(BaseModel):
    id: str = Field(..., description="Unique task identifier")
    title: str = Field(..., description="Task title or milestone name")
    description: Optional[str] = Field(default="", description="Detailed task notes or steps")
    priority: TodoPriority = Field(default=TodoPriority.MEDIUM, description="Task priority")
    category: str = Field(default="General", description="Category or tag (e.g., Work, Personal, Study, AI Plan)")
    due_date: Optional[str] = Field(default=None, description="ISO due date string or target timeframe")
    completed: bool = Field(default=False, description="Whether the task is checked off as completed")
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat(), description="Creation timestamp")
    source: TodoSource = Field(default=TodoSource.MANUAL, description="Origin of this todo item")


class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1, description="Task title")
    description: Optional[str] = Field(default="", description="Task description or notes")
    priority: TodoPriority = Field(default=TodoPriority.MEDIUM, description="Task priority")
    category: Optional[str] = Field(default="General", description="Category")
    due_date: Optional[str] = Field(default=None, description="Due date")
    completed: Optional[bool] = Field(default=False, description="Initial completed status")
    source: Optional[TodoSource] = Field(default=TodoSource.MANUAL, description="Source of todo")


class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[TodoPriority] = None
    category: Optional[str] = None
    due_date: Optional[str] = None
    completed: Optional[bool] = None


class TodoGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=2, description="User goal, prompt, or task notes to convert into To-Dos")
    category: Optional[str] = Field(default="AI Plan", description="Category to assign generated tasks")
    priority: Optional[TodoPriority] = Field(default=TodoPriority.HIGH, description="Default priority")


class TodoListResponse(BaseModel):
    total: int
    completed: int
    pending: int
    todos: List[TodoItem]
