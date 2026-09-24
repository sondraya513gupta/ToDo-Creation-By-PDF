from abc import ABC, abstractmethod
from typing import Any, Dict
from app.models.agent import ExecutionPlan


class BaseReflector(ABC):
    @abstractmethod
    async def reflect(self, plan: ExecutionPlan) -> Dict[str, Any]:
        """
        Critiques the results of the plan execution and compiles the final polished content.
        """
        pass
