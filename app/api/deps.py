from fastapi import Depends
from app.services.agent import AgentService
from app.planner.gemini_planner import GeminiPlanner
from app.executor.step_executor import StepExecutor
from app.reflection.self_reflection import SelfReflection
from app.document.docx_generator import DocxGenerator
from app.services.gemini import GeminiService


def get_gemini_service() -> GeminiService:
    return GeminiService()


def get_planner(gemini_service: GeminiService = Depends(get_gemini_service)) -> GeminiPlanner:
    return GeminiPlanner(gemini_service=gemini_service)


def get_executor(gemini_service: GeminiService = Depends(get_gemini_service)) -> StepExecutor:
    return StepExecutor(gemini_service=gemini_service)


def get_reflector(gemini_service: GeminiService = Depends(get_gemini_service)) -> SelfReflection:
    return SelfReflection(gemini_service=gemini_service)


def get_doc_generator() -> DocxGenerator:
    return DocxGenerator()


def get_agent_service(
    planner: GeminiPlanner = Depends(get_planner),
    executor: StepExecutor = Depends(get_executor),
    reflector: SelfReflection = Depends(get_reflector),
    doc_generator: DocxGenerator = Depends(get_doc_generator),
) -> AgentService:
    return AgentService(
        planner=planner,
        executor=executor,
        reflector=reflector,
        doc_generator=doc_generator,
    )
