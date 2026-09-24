import json
import logging
from typing import Any, Dict
from app.models.agent import ExecutionPlan
from app.reflection.base import BaseReflector
from app.services.gemini import GeminiService, GeminiAPIError

from app.core.settings import settings

logger = logging.getLogger(__name__)

"""
Why Reflection improves autonomous reasoning:
1. Closed-loop Verification: Autonomous agents can generate text that is grammatically correct but factually or structurally incomplete. Reflection introduces a feedback loop that evaluates the output against explicit constraints before declaring completion.
2. Self-Correction: Instead of failing silently or requiring human intervention when a milestone is skipped or generated poorly, the reflection agent detects the omission and calls the generation models again to patch/correct the content dynamically.
3. Quality Gatekeeping: It acts as a validation check layer in clean architecture, ensuring downstream consumers (like document generators or human readers) only receive verified, complete artifacts.
"""


class SelfReflection(BaseReflector):
    def __init__(self, gemini_service: GeminiService):
        self.gemini_service = gemini_service
        self.required_sections = settings.VALIDATION_REQUIRED_SECTIONS

    async def reflect(self, plan: ExecutionPlan) -> Dict[str, Any]:
        logger.info("Starting self-reflection and quality check phase...")
        
        # Combine the results of all steps to form the draft document content
        draft_content = self._combine_step_results(plan)

        if not self.gemini_service.api_key:
            logger.warning("Missing API key. Performing reflection verification in fallback mode.")
            return self._reflect_fallback(draft_content)

        # Prompt instructing Gemini to analyze the draft, identify missing sections, generate them, and return JSON.
        prompt = (
            f"You are a Self-Reflection and Quality Check Agent. Your goal is to review the compiled document draft below "
            f"and verify that all of these required sections exist in the content:\n"
            f"{', '.join(self.required_sections)}\n\n"
            f"Document Draft:\n"
            f"{draft_content}\n\n"
            f"Instructions:\n"
            f"1. Check if all required sections exist in the draft (either as headers or clear thematic subdivisions).\n"
            f"2. If any sections are missing, generate professional content for the missing sections, insert/append them "
            f"appropriately, and return the complete updated document draft in 'final_content'. Set 'status' to 'CORRECTED'.\n"
            f"3. If all required sections exist and look correct, set 'final_content' to the original draft, and set 'status' to 'PASSED'.\n"
            f"4. Output the results ONLY as a JSON object matching the following structure:\n"
            f"{{\n"
            f"  \"all_present\": true/false,\n"
            f"  \"missing_sections\": [\"Timeline\"],\n"
            f"  \"final_content\": \"updated markdown draft here\",\n"
            f"  \"status\": \"PASSED\" or \"CORRECTED\"\n"
            f"}}\n"
            f"Do not return markdown wrappers like ```json, or any explanatory text."
        )

        try:
            raw_response = await self.gemini_service.generate_content(
                prompt=prompt,
                response_mime_type="application/json"
            )
            logger.debug(f"Reflection API Response: {raw_response}")

            result = json.loads(raw_response)
            
            return {
                "content": result.get("final_content", draft_content),
                "success": True,
                "status": result.get("status", "PASSED"),
                "critique": f"Missing sections found: {result.get('missing_sections', [])}"
            }

        except (GeminiAPIError, Exception) as err:
            logger.error(f"Error during Gemini reflection verification: {err}")
            return self._reflect_fallback(draft_content)

    def _combine_step_results(self, plan: ExecutionPlan) -> str:
        sections = []
        for step in plan.steps:
            if step.result:
                sections.append(step.result)
        return "\n\n---\n\n".join(sections)

    def _reflect_fallback(self, draft_content: str) -> Dict[str, Any]:
        # Local validation using simple case-insensitive search
        missing = []
        for section in self.required_sections:
            if section.lower() not in draft_content.lower():
                missing.append(section)

        final_content = draft_content
        status = "PASSED"

        if missing:
            logger.info(f"Fallback Reflection: Missing sections identified: {missing}. Repairing...")
            status = "CORRECTED"
            additions = []
            for sec in missing:
                additions.append(
                    f"\n\n---\n\n"
                    f"# {sec}\n\n"
                    f"This section for '{sec}' was automatically generated by the Self-Reflection recovery agent "
                    f"after detecting its absence from the draft document."
                )
            final_content += "".join(additions)
        else:
            logger.info("Fallback Reflection: All required sections are present.")

        return {
            "content": final_content,
            "success": True,
            "status": status,
            "critique": f"Fallback check completed. Missing sections identified and generated: {missing}."
        }


