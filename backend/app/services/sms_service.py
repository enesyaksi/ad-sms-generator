from app.clients.gemini_client import GeminiClient
from app.models.request_models import SMSRequest
from app.models.response_models import SMSResponse, SMSDraft
import asyncio

class SMSService:
    def __init__(self):
        self.client = GeminiClient()

    def _construct_prompt(self, data: SMSRequest) -> str:
        products_str = ", ".join(data.products)
        prompt = f"""
        Act as a professional SMS marketing copywriter.
        Create 3 distinct SMS ad drafts for a campaign.
        
        Campaign Details:
        - Website: {data.website_url}
        - Phone: {data.phone_number}
        - Products: {products_str}
        - Discount: {data.discount_rate}%
        - Start Date: {data.start_date or 'N/A'}
        - End Date: {data.end_date or 'N/A'}

        Required Draft Types:
        1. Short: Concise, punchy, under 160 chars if possible.
        2. Urgent: Focus on FOMO (Fear Of Missing Out), limited time/stock.
        3. Friendly: Conversational, warm, emoji-rich.

        Format the output EXACTLY as follows (no markdown, just the content separated by delimiters):
        ---SHORT---
        [Content for Short]
        ---URGENT---
        [Content for Urgent]
        ---FRIENDLY---
        [Content for Friendly]
        """
        return prompt

    async def generate_campaign_drafts(self, data: SMSRequest) -> SMSResponse:
        prompt = self._construct_prompt(data)
        
        # Call Gemini
        generated_text = await self.client.generate_text(prompt)
        
        # Parse Response
        drafts = self._parse_generated_text(generated_text)
        
        return SMSResponse(drafts=drafts)

    def _parse_generated_text(self, text: str) -> list[SMSDraft]:
        drafts = []
        
        try:
            # Simple parsing based on the requested format
            parts = text.split("---")
            current_type = None
            
            type_map = {
                "SHORT": "Short",
                "URGENT": "Urgent",
                "FRIENDLY": "Friendly"
            }

            for part in parts:
                clean_part = part.strip()
                if not clean_part:
                    continue
                
                if clean_part in type_map:
                    current_type = type_map[clean_part]
                elif current_type:
                    drafts.append(SMSDraft(type=current_type, content=clean_part))
                    current_type = None
            
            # Fallback if parsing fails (Gemini might not obey format perfectly)
            if not drafts:
                drafts.append(SMSDraft(type="Raw", content=text))
                
        except Exception as e:
            print(f"Parsing error: {e}")
            drafts.append(SMSDraft(type="Error", content="Could not parse AI response. Raw: " + text[:100]))

        return drafts
