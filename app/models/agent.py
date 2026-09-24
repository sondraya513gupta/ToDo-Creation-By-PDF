from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class ExecutionStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"


class AgentRequest(BaseModel):
    request: str = Field(
        ...,
        description="The natural language request for the AI agent to fulfill.",
        examples=["Create a modern professional marketing proposal for a new tech startup."],
    )

    @field_validator("request")
    @classmethod
    def validate_request_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Request prompt cannot be empty or only whitespace.")
        return v.strip()


class ExecutionStep(BaseModel):
    id: int = Field(..., description="Unique step identifier (sequence order)")
    description: str = Field(..., description="Actionable description of the step")
    status: ExecutionStatus = Field(
        default=ExecutionStatus.PENDING,
        description="Execution status of this step"
    )
    result: Optional[str] = Field(
        default=None,
        description="Raw output produced by this step"
    )


class ExecutionPlan(BaseModel):
    steps: List[ExecutionStep] = Field(
        default_factory=list,
        description="The list of sequential steps to achieve the user goal."
    )


class AgentResponse(BaseModel):
    status: str = Field(
        ...,
        description="Overall execution status of the agent request.",
        examples=["success"]
    )
    plan: List[str] = Field(
        ...,
        description="The planned milestones/steps executed by the agent.",
        examples=[[
            "1. Analyze request: Create a document about clean architecture.",
            "2. Identify target audience and layout assumptions",
            "3. Draft initial structured document sections",
            "4. Perform reflection check and verification",
            "5. Compile and generate Word (.docx) document"
        ]]
    )
    document: str = Field(
        ...,
        description="File path of the generated Microsoft Word (.docx) document.",
        examples=["generated_docs/report_b14db171.docx"]
    )
    execution_log: List[str] = Field(
        ...,
        description="Log entries detailing the step-by-step execution path of the agent.",
        examples=[[
            "Planning phase: Plan generated with 5 steps.",
            "Execution phase: Commencing plan step execution.",
            "Reflection phase: Reflection check passed = True.",
            "Document generation phase: Document saved successfully."
        ]]
    )

