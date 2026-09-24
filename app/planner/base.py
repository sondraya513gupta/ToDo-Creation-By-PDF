from abc import ABC, abstractmethod
from app.models.agent import ExecutionPlan


class BasePlanner(ABC):
    @abstractmethod
    async def create_plan(self, prompt: str) -> ExecutionPlan:
        """
        Translates a natural language request prompt into an execution plan.
        """
        pass
