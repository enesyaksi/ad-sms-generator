import google.generativeai as genai
from app.config.settings import GEMINI_API_KEY

class GeminiClient:
    def __init__(self):
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set")
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-flash-latest')

    async def generate_json(self, prompt: str) -> dict:
        try:
            # Re-configuring for JSON mode if supported, or just requesting strict JSON in prompt
            response = self.model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            import json
            return json.loads(response.text)
        except Exception as e:
            print(f"Error calling Gemini for JSON: {e}")
            return {"phone": None}
