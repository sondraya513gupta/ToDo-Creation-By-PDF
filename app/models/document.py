from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class DocumentSection(BaseModel):
    title: str = Field(..., description="Section title or heading")
    level: int = Field(default=1, description="Heading level (1-9)")
    content: str = Field(..., description="Paragraph text or markdown of the section")


class DocumentMetadata(BaseModel):
    title: str = Field(..., description="Document Title")
    author: str = Field(default="AI Document Agent", description="Document Author")
    theme: Optional[str] = Field(default="Modern", description="Visual styling theme")
    properties: Dict[str, str] = Field(default_factory=dict, description="Key-value document properties")


class DocumentPayload(BaseModel):
    metadata: DocumentMetadata
    sections: List[DocumentSection] = Field(default_factory=list)
