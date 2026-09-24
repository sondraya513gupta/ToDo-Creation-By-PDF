from abc import ABC, abstractmethod
from typing import List
from pydantic import BaseModel, Field
from app.models.agent import ExecutionPlan


class ExecutorOutput(BaseModel):
    plan: ExecutionPlan = Field(..., description="The updated execution plan with results/statuses.")
    generated_content: str = Field(..., description="Combined content generated across all steps.")
    execution_logs: List[str] = Field(..., description="Logs generated during step-by-step execution.")
    success: bool = Field(..., description="Whether the entire plan executed successfully.")


class BaseExecutor(ABC):
    @abstractmethod
    async def execute(self, plan: ExecutionPlan, request: str) -> ExecutorOutput:
        """
        Executes each step of the provided ExecutionPlan and returns the combined results.
        """
        pass

