from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, Dict


class BaseDocumentGenerator(ABC):
    @abstractmethod
    async def generate(self, reflection_data: Dict[str, Any]) -> Path:
        """
        Generates a Word (.docx) document based on the reflection output data.
        Returns the absolute Path to the generated document file.
        """
        pass
