import asyncio
import logging
from typing import Optional
import google.generativeai as genai
from app.core.settings import settings

logger = logging.getLogger(__name__)


from app.core.exceptions import (
    GeminiAPIError,
    GeminiServiceError,
    GeminiTimeoutException,
    GeminiFailureException,
)


class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if self.api_key == "your_gemini_api_key_here" or not self.api_key.strip():
            self.api_key = ""
        self.model_name = settings.GEMINI_MODEL
        if self.api_key:
            genai.configure(api_key=self.api_key)
        else:
            logger.warning("GEMINI_API_KEY is not configured in settings. Working in fallback mode.")

    async def generate_content(
        self, prompt: str, response_mime_type: Optional[str] = None
    ) -> str:
        """
        Sends a generation request prompt to Gemini API with a retry mechanism.
        """
        if not self.api_key:
            raise GeminiAPIError("Missing GEMINI_API_KEY environment variable setting.")

        generation_config = {}
        if response_mime_type:
            generation_config["response_mime_type"] = response_mime_type

        # Retrying once upon failure (total 2 attempts)
        for attempt in [1, 2]:
            try:
                logger.info(f"Invoking Gemini API (Model: {self.model_name}, Attempt: {attempt})...")
                model = genai.GenerativeModel(
                    model_name=self.model_name,
                    generation_config=generation_config
                )
                # Async generation call
                response = await model.generate_content_async(prompt)
                
                if not response or not response.text:
                    raise GeminiAPIError("Gemini API returned an empty or invalid response text.")
                
                return response.text.strip()
            except (asyncio.TimeoutError, TimeoutError) as timeout_err:
                logger.warning(f"Gemini API attempt {attempt} timed out: {timeout_err}")
                if attempt == 2:
                    raise GeminiTimeoutException(f"Gemini API call timed out: {timeout_err}") from timeout_err
                await asyncio.sleep(1)
            except Exception as err:
                logger.warning(f"Gemini API attempt {attempt} failed: {err}")
                if attempt == 2:
                    raise GeminiFailureException(f"Gemini API call failed after retries: {err}") from err
                await asyncio.sleep(1)
