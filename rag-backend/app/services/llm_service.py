import logging
import httpx
from app.core.config import settings

logger = logging.getLogger("rag-backend.llm_service")

class LLMServiceError(Exception):
    """Exception raised when an error occurs during LLM generation."""
    pass

class LLMService:
    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        """
        Provider-independent interface for LLM text generation.
        Reads credentials and model settings from environment variables.
        """
        provider = settings.LLM_PROVIDER
        api_key = settings.LLM_API_KEY
        model = settings.LLM_MODEL

        if not provider or not api_key:
            logger.error("LLM generation called but LLM_PROVIDER or LLM_API_KEY is not configured.")
            raise LLMServiceError("LLM provider or API key is not configured.")

        provider_lower = provider.strip().lower()

        try:
            if provider_lower == "groq":
                return await self._call_groq(system_prompt, user_prompt, api_key, model)
            elif provider_lower == "openai":
                return await self._call_openai(system_prompt, user_prompt, api_key, model)
            else:
                logger.error(f"Unsupported LLM provider: {provider}")
                raise LLMServiceError(f"LLM provider '{provider}' is not supported.")
        except httpx.TimeoutException as exc:
            logger.error(f"LLM request timed out: {exc}")
            raise LLMServiceError(f"LLM request timed out: {exc}") from exc
        except httpx.HTTPStatusError as exc:
            logger.error(f"LLM HTTP error {exc.response.status_code}: {exc.response.text}")
            raise LLMServiceError(f"LLM HTTP {exc.response.status_code}: {exc.response.text}") from exc
        except Exception as exc:
            if isinstance(exc, LLMServiceError):
                raise
            logger.error(f"Unexpected error during LLM generation: {exc}")
            raise LLMServiceError(f"LLM generation failed: {exc}") from exc

    async def _call_groq(self, system_prompt: str, user_prompt: str, api_key: str, model: str | None) -> str:
        import asyncio
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model or "openai/gpt-oss-120b",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2
        }

        # Handle transient rate limits (429) with exponential retry
        max_attempts = 3
        for attempt in range(max_attempts):
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=payload, timeout=30.0)
                if response.status_code == 429 and attempt < max_attempts - 1:
                    retry_after = 3.0
                    try:
                        retry_after = float(response.headers.get("retry-after", 3.0))
                    except (ValueError, TypeError):
                        pass
                    wait_time = min(max(retry_after, 2.0), 6.0)
                    logger.warning(f"Groq 429 rate limit hit. Pausing for {wait_time:.1f}s before retry {attempt + 1}/{max_attempts}...")
                    await asyncio.sleep(wait_time)
                    continue

                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]

    async def _call_openai(self, system_prompt: str, user_prompt: str, api_key: str, model: str | None) -> str:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model or "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

llm_service = LLMService()
