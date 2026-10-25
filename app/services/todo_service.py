import json
import logging
import uuid
import io
from pathlib import Path
from typing import List, Optional
from datetime import datetime
from pypdf import PdfReader

from app.models.todo import (
    TodoItem,
    TodoCreate,
    TodoUpdate,
    TodoPriority,
    TodoSource,
    TodoListResponse,
)
from app.services.gemini import GeminiService

logger = logging.getLogger(__name__)

STORAGE_PATH = Path("outputs/todos.json")


class TodoService:
    def __init__(self, gemini_service: Optional[GeminiService] = None):
        self.gemini = gemini_service or GeminiService()
        self._ensure_storage()

    def _ensure_storage(self):
        STORAGE_PATH.parent.mkdir(parents=True, exist_ok=True)
        if not STORAGE_PATH.exists() or STORAGE_PATH.stat().st_size == 0:
            initial_todos = [
                {
                    "id": str(uuid.uuid4())[:8],
                    "title": "Welcome to your AI Todo & Document Assistant! 👋",
                    "description": "Create new tasks manually, generate plans using AI, or extract tasks from PDFs.",
                    "priority": "high",
                    "category": "Getting Started",
                    "due_date": datetime.now().strftime("%Y-%m-%d"),
                    "completed": False,
                    "created_at": datetime.now().isoformat(),
                    "source": "manual",
                },
                {
                    "id": str(uuid.uuid4())[:8],
                    "title": "Try AI Planner: Type any goal to auto-generate tasks 🤖",
                    "description": "Use the 'AI Plan' tab to generate a breakdown of any objective into milestones.",
                    "priority": "medium",
                    "category": "AI Plan",
                    "due_date": datetime.now().strftime("%Y-%m-%d"),
                    "completed": False,
                    "created_at": datetime.now().isoformat(),
                    "source": "ai_plan",
                },
                {
                    "id": str(uuid.uuid4())[:8],
                    "title": "Upload a PDF syllabus or project doc to extract ToDos 📄",
                    "description": "Extract tasks, assignments, and deadlines automatically with the PDF tab.",
                    "priority": "low",
                    "category": "PDF Extraction",
                    "due_date": None,
                    "completed": False,
                    "created_at": datetime.now().isoformat(),
                    "source": "pdf_extract",
                },
            ]
            self._write_todos(initial_todos)

    def _read_todos(self) -> List[dict]:
        try:
            if not STORAGE_PATH.exists():
                return []
            with open(STORAGE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading todos from {STORAGE_PATH}: {e}")
            return []

    def _write_todos(self, items: List[dict]):
        try:
            STORAGE_PATH.parent.mkdir(parents=True, exist_ok=True)
            with open(STORAGE_PATH, "w", encoding="utf-8") as f:
                json.dump(items, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error writing todos to {STORAGE_PATH}: {e}")

    def get_all(
        self,
        category: Optional[str] = None,
        completed: Optional[bool] = None,
        priority: Optional[str] = None,
        search: Optional[str] = None,
    ) -> TodoListResponse:
        raw_items = self._read_todos()
        items = [TodoItem(**item) for item in raw_items]

        if category and category.lower() != "all":
            items = [t for t in items if t.category.lower() == category.lower()]

        if completed is not None:
            items = [t for t in items if t.completed == completed]

        if priority and priority.lower() != "all":
            items = [t for t in items if t.priority.value.lower() == priority.lower()]

        if search and search.strip():
            q = search.strip().lower()
            items = [
                t for t in items
                if q in t.title.lower() or (t.description and q in t.description.lower())
            ]

        total = len(items)
        completed_count = sum(1 for t in items if t.completed)
        pending_count = total - completed_count

        return TodoListResponse(
            total=total,
            completed=completed_count,
            pending=pending_count,
            todos=items,
        )

    def create(self, data: TodoCreate) -> TodoItem:
        items = self._read_todos()
        new_item = TodoItem(
            id=str(uuid.uuid4())[:8],
            title=data.title.strip(),
            description=(data.description or "").strip(),
            priority=data.priority,
            category=(data.category or "General").strip(),
            due_date=data.due_date,
            completed=data.completed or False,
            created_at=datetime.now().isoformat(),
            source=data.source or TodoSource.MANUAL,
        )
        items.insert(0, new_item.model_dump())
        self._write_todos(items)
        return new_item

    def update(self, todo_id: str, update_data: TodoUpdate) -> Optional[TodoItem]:
        items = self._read_todos()
        for idx, item in enumerate(items):
            if item["id"] == todo_id:
                if update_data.title is not None:
                    item["title"] = update_data.title.strip()
                if update_data.description is not None:
                    item["description"] = update_data.description.strip()
                if update_data.priority is not None:
                    item["priority"] = update_data.priority.value
                if update_data.category is not None:
                    item["category"] = update_data.category.strip()
                if update_data.due_date is not None:
                    item["due_date"] = update_data.due_date
                if update_data.completed is not None:
                    item["completed"] = update_data.completed

                items[idx] = item
                self._write_todos(items)
                return TodoItem(**item)
        return None

    def delete(self, todo_id: str) -> bool:
        items = self._read_todos()
        initial_len = len(items)
        items = [item for item in items if item["id"] != todo_id]
        if len(items) < initial_len:
            self._write_todos(items)
            return True
        return False

    async def generate_todos_from_prompt(
        self, prompt: str, category: str = "AI Plan", priority: TodoPriority = TodoPriority.HIGH
    ) -> List[TodoItem]:
        logger.info(f"Generating AI ToDos for prompt: {prompt}")

        system_instruction = (
            "You are an expert project manager and agile task planner. "
            "Given the user request or goal, break it down into 4 to 8 clear, actionable, high-quality todo items. "
            "Return strictly valid JSON array of objects with the following keys:\n"
            "- 'title': concise actionable task title\n"
            "- 'description': specific guidance, tools, or steps to complete it\n"
            "- 'priority': one of 'high', 'medium', 'low'\n"
            "- 'category': relevant tag (e.g. 'Frontend', 'Backend', 'Design', 'Research', 'Milestone')\n"
            "Do not include markdown code block backticks if possible, return clean raw JSON."
        )

        full_prompt = f"{system_instruction}\n\nUser Goal / Prompt: {prompt}"

        generated_todos = []
        try:
            response_text = await self.gemini.generate_content(
                full_prompt, response_mime_type="application/json"
            )
            # Clean up backticks if present
            cleaned = response_text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            parsed = json.loads(cleaned.strip())
            if isinstance(parsed, list):
                for obj in parsed:
                    p = obj.get("priority", "medium").lower()
                    pri = TodoPriority.MEDIUM
                    if p == "high":
                        pri = TodoPriority.HIGH
                    elif p == "low":
                        pri = TodoPriority.LOW

                    item = self.create(
                        TodoCreate(
                            title=obj.get("title", "Action Item"),
                            description=obj.get("description", ""),
                            priority=pri,
                            category=obj.get("category", category),
                            source=TodoSource.AI_PLAN,
                        )
                    )
                    generated_todos.append(item)
        except Exception as e:
            logger.warning(f"Gemini API generation failed or not configured: {e}. Using intelligent fallback.")
            # Fallback heuristic task decomposition
            words = prompt.strip().split()
            base_title = " ".join(words[:6])
            fallback_tasks = [
                {
                    "title": f"Phase 1: Research & Scope requirements for '{base_title}'",
                    "desc": f"Define goals, collect background resources, and map out project specifications for: {prompt}.",
                    "pri": TodoPriority.HIGH,
                    "cat": "Planning",
                },
                {
                    "title": f"Phase 2: Architecture & Setup environment",
                    "desc": "Initialize core repository, configure runtime tools, API keys, and dependencies.",
                    "pri": TodoPriority.HIGH,
                    "cat": "Setup",
                },
                {
                    "title": f"Phase 3: Core Implementation & Feature building",
                    "desc": "Develop essential logic, modular services, UI screens, and core integration.",
                    "pri": TodoPriority.MEDIUM,
                    "cat": "Development",
                },
                {
                    "title": f"Phase 4: Validation, Testing & Bug Fixing",
                    "desc": "Verify corner cases, test API integrations, check responsiveness and error handling.",
                    "pri": TodoPriority.MEDIUM,
                    "cat": "Testing",
                },
                {
                    "title": f"Phase 5: Final Review & Production Deployment",
                    "desc": "Prepare documentation, compile build assets, and launch project.",
                    "pri": TodoPriority.LOW,
                    "cat": "Deployment",
                },
            ]
            for t in fallback_tasks:
                item = self.create(
                    TodoCreate(
                        title=t["title"],
                        description=t["desc"],
                        priority=t["pri"],
                        category=category or t["cat"],
                        source=TodoSource.AI_PLAN,
                    )
                )
                generated_todos.append(item)

        return generated_todos

    async def extract_todos_from_pdf(self, pdf_bytes: bytes, filename: str = "document.pdf") -> List[TodoItem]:
        logger.info(f"Extracting ToDos from PDF: {filename} ({len(pdf_bytes)} bytes)")
        extracted_text = ""
        try:
            reader = PdfReader(io.BytesIO(pdf_bytes))
            for idx, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    extracted_text += f"\n--- Page {idx + 1} ---\n" + text
        except Exception as e:
            logger.error(f"Failed to parse PDF bytes: {e}")
            raise ValueError(f"Could not read PDF document: {e}")

        if not extracted_text.strip():
            extracted_text = f"Document '{filename}' was uploaded but contained little or no selectable text."

        # Limit text to 6000 chars for prompt efficiency
        truncated_text = extracted_text[:6000]

        prompt = (
            f"You are an AI document analysis agent. Analyze the following document text from '{filename}', "
            "identify all required deliverables, action items, assignments, tasks, deadlines, and milestones, "
            "and convert them into a structured JSON array of actionable To-Do items.\n"
            "Return strictly a JSON array of objects with keys: 'title', 'description', 'priority' ('high', 'medium', 'low'), 'category'.\n\n"
            f"Document Text:\n{truncated_text}"
        )

        extracted_todos = []
        try:
            response_text = await self.gemini.generate_content(
                prompt, response_mime_type="application/json"
            )
            cleaned = response_text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            parsed = json.loads(cleaned.strip())
            if isinstance(parsed, list):
                for obj in parsed:
                    p = obj.get("priority", "medium").lower()
                    pri = TodoPriority.MEDIUM
                    if p == "high":
                        pri = TodoPriority.HIGH
                    elif p == "low":
                        pri = TodoPriority.LOW

                    item = self.create(
                        TodoCreate(
                            title=obj.get("title", "Document Action Item"),
                            description=obj.get("description", f"Extracted from {filename}"),
                            priority=pri,
                            category=obj.get("category", "PDF Extracted"),
                            source=TodoSource.PDF_EXTRACT,
                        )
                    )
                    extracted_todos.append(item)
        except Exception as e:
            logger.warning(f"Gemini API extraction failed: {e}. Using fallback document parsing.")
            lines = [l.strip() for l in extracted_text.splitlines() if len(l.strip()) > 15]
            sample_lines = lines[:5] if lines else [f"Review document {filename} content"]

            for idx, line in enumerate(sample_lines):
                item = self.create(
                    TodoCreate(
                        title=f"Task {idx + 1}: {line[:70]}",
                        description=f"Action item identified from uploaded PDF: {filename}",
                        priority=TodoPriority.HIGH if idx == 0 else TodoPriority.MEDIUM,
                        category="PDF Extracted",
                        source=TodoSource.PDF_EXTRACT,
                    )
                )
                extracted_todos.append(item)

        return extracted_todos
