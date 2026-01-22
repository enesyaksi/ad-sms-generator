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
        Profesyonel bir SMS pazarlama metin yazarı olarak hareket et.
        Bir kampanya için 3 farklı Türkçe SMS taslağı oluştur.
        
        Kampanya Detayları:
        - Web Sitesi: {data.website_url}
        - Telefon: {data.phone_number}
        - Ürünler: {products_str}
        - İndirim Oranı: %{data.discount_rate}
        - Başlangıç Tarihi: {data.start_date or 'Belirtilmedi'}
        - Bitiş Tarihi: {data.end_date or 'Belirtilmedi'}

        ZORUNLU KURALLAR:
        1. Her bir taslak MUTLAKA "{data.website_url}" adresini içermelidir.
        2. Her bir taslak MUTLAKA "{data.phone_number}" numarasını içermelidir.
        3. Metinler akıcı olmalı, sadece link ve numara yığını olmamalıdır.

        İstenen Taslak Türleri (Hepsi TÜRKÇE olmalı):
        1. Kısa (Short): Öz, vurucu, yaklaşık 250 karakter.
        2. Acil (Urgent): FOMO (Fırsatı Kaçırma Korkusu) odaklı, sınırlı zaman/stok. Yaklaşık 250 karakter.
        3. Samimi (Friendly): Konuşma dilinde, sıcak, bol emojili. Yaklaşık 250 karakter.

        Çıktıyı TAM OLARAK aşağıdaki formatta ver (markdown yok, sadece ayırıcılarla ayrılmış içerik):
        ---SHORT---
        [Kısa Taslak İçeriği]
        ---URGENT---
        [Acil Taslak İçeriği]
        ---FRIENDLY---
        [Samimi Taslak İçeriği]
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
