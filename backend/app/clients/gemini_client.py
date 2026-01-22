import google.generativeai as genai
from app.config.settings import GEMINI_API_KEY

class GeminiClient:
    def __init__(self):
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set")
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-flash-latest')

    async def generate_text(self, prompt: str) -> str:
        try:
            # Gemini calls are synchronous, wrap if needed or use run_in_executor in real production
            # For this MVP, direct call is fine or we can assume async usage if library supports it (it handles it).
            # Actually google-generativeai 'generate_content' is synchronous blocking by default 
            # unless using the async client which is newer. 
            # Let's use standard call for simplicity, or wrap in future.
            
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Error calling Gemini: {e}")
            raise e
