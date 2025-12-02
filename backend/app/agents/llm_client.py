import os
import time
import random
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class GeminiQuotaError(Exception):
    """Raised when daily free-tier quota is exceeded and retrying won't help."""
    pass

class GeminiRateLimitError(Exception):
    """Raised after several retries when a short-term rate limit persists."""
    pass

class GeminiClient:
    def __init__(self, model_name: str = None):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        # DEBUG: Print masked key to verify loading
        masked_key = f"{self.api_key[:4]}...{self.api_key[-4:]}" if len(self.api_key) > 8 else "****"
        print(f"DEBUG: Loaded GEMINI_API_KEY: {masked_key} from CWD: {os.getcwd()}")
        
        genai.configure(api_key=self.api_key)
        
        # Models
        # Use env var or passed arg, default to gemini-2.5-pro
        env_model = os.getenv("GEMINI_MODEL", "gemini-2.5-pro")
        self.model_name = model_name or env_model
        
        self.model = genai.GenerativeModel(self.model_name)

    def generate_content(self, prompt: str, max_retries: int = 3, base_delay: float = 2.0) -> str:
        """
        Generates content using Gemini with automatic retry and exponential backoff.
        """
        last_exception = None

        for attempt in range(max_retries + 1):
            try:
                response = self.model.generate_content(prompt)
                return response.text
            except Exception as e:
                last_exception = e
                msg = str(e)
                
                # Check for Quota Exceeded (Hard Stop)
                # Patterns: "FreeTier", "GenerateRequestsPerDayPerProjectPerModel", "quota"
                if "FreeTier" in msg or "GenerateRequestsPerDayPerProjectPerModel" in msg or "quota" in msg.lower():
                     raise GeminiQuotaError(f"Gemini daily free-tier quota exceeded for {self.model_name}. Use a paid key, switch model, or try again tomorrow.") from e

                # Check for Rate Limit / 429 (Retryable)
                if "429" in msg or "rate limit" in msg.lower():
                    if attempt < max_retries:
                        # Exponential backoff
                        delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
                        print(f"[{self.model_name}] Rate limit hit (429). Retrying in {delay:.2f}s... (Attempt {attempt+1}/{max_retries})")
                        time.sleep(delay)
                        continue
                    else:
                        raise GeminiRateLimitError(f"Gemini rate limit hit after {max_retries} retries: {msg}") from e
                
                # Other errors: re-raise immediately
                raise e
        
        # Should not be reached if logic is correct, but as a fallback
        raise last_exception if last_exception else Exception("Unknown error in generate_content")
