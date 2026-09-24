import logging
from pathlib import Path
from typing import List
from app.models.agent import AgentResponse, ExecutionPlan
from app.planner.base import BasePlanner
from app.executor.base import BaseExecutor
from app.reflection.base import BaseReflector
from app.document.base import BaseDocumentGenerator

logger = logging.getLogger(__name__)


class AgentService:
    def __init__(
        self,
        planner: BasePlanner,
        executor: BaseExecutor,
        reflector: BaseReflector,
        doc_generator: BaseDocumentGenerator,
    ):
        self.planner = planner
        self.executor = executor
        self.reflector = reflector
        self.doc_generator = doc_generator

    async def execute_request(self, request: str) -> AgentResponse:
        logger.info(f"Starting agent execution flow for request: {request}")
        execution_log: List[str] = []

        # 1. Understand request and create execution plan
        execution_log.append("Planning phase: Initializing planner to analyze request.")
        plan: ExecutionPlan = await self.planner.create_plan(request)
        execution_log.append(f"Planning phase: Plan generated with {len(plan.steps)} steps.")

        # 2. Execute each step
        execution_log.append("Execution phase: Commencing plan step execution.")
        executor_out = await self.executor.execute(plan, request)
        execution_log.extend(executor_out.execution_logs)

        # 3. Quality reflection & check
        execution_log.append("Reflection phase: Reviewing and critiquing output content.")
        reflection_result = await self.reflector.reflect(executor_out.plan)
        is_success = reflection_result.get("success", False)
        execution_log.append(f"Reflection phase: Reflection check passed = {is_success}.")

        # 4. Generate polished Word document
        execution_log.append("Document generation phase: Creating Word document (.docx).")
        doc_path: Path = await self.doc_generator.generate(reflection_result)
        execution_log.append(f"Document generation phase: Document saved successfully at '{doc_path}'.")

        plan_steps = [step.description for step in plan.steps]
        overall_status = "success" if (executor_out.success and is_success) else "failed"

        return AgentResponse(
            status=overall_status,
            plan=plan_steps,
            document=str(doc_path),
            execution_log=execution_log
        )


