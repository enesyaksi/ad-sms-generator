import httpx
import re
from bs4 import BeautifulSoup
from app.clients.gemini_client import GeminiClient
from app.models.request_models import SMSRequest
from app.models.response_models import SMSResponse, SMSDraft
import asyncio

from app.services.website_scraper import WebsiteScraper

class SMSService:
    def __init__(self):
        self.client = GeminiClient()
        self.scraper = WebsiteScraper()
        self.draft_types = [
            "Klasik", "Acil", "Samimi", "Minimalist", 
            "Hikaye Odaklı", "Soru & Cevap", "Modern", 
            "Lüks", "Genç", "Vurucu"
        ]

    def _construct_prompt(self, data: SMSRequest, scraped_info: str, phone_number: str) -> str:
        products_str = ", ".join(data.products)
        count = min(max(data.message_count, 1), 10)
        selected_types = self.draft_types[:count]
        
        prompt = f"""
        Profesyonel bir SMS pazarlama metin yazarı olarak hareket et.
        Bir kampanya için TAM OLARAK {count} farklı Türkçe SMS taslağı oluştur.
        
        Kampanya Detayları:
        - Web Sitesi: {data.website_url}
        - İletişim Numarası: {phone_number}
        - Ürünler: {products_str}
        - İndirim Oranı: %{data.discount_rate}
        - Başlangıç Tarihi: {data.start_date or 'Belirtilmedi'}
        - Bitiş Tarihi: {data.end_date or 'Belirtilmedi'}
        - Hedef Kitle: {data.target_audience}
        
        Web Sitesinden Alınan Ek Bilgiler:
        {scraped_info}

        ZORUNLU KURALLAR:
        1. Her bir taslak MUTLAKA "{data.website_url}" adresini içermelidir.
        2. Her bir taslak MUTLAKA "{phone_number}" iletişim numarasini içermelidir (eğer numara 'Belirtilmedi' değilse).
        3. Metinler akıcı olmalı.
        4. Kampanya tarihlerini ve indirim oranını metne doğal bir şekilde yedir.
        5. Tarih belirtirken MUTLAKA yılı da ekle (Örn: 29.01.2026 veya 29 Ocak 2026). Sadece gün/ay yazma.
        6. Hedef kitleye ({data.target_audience}) uygun bir dil kullan.
        7. Her mesaj yaklaşık 250 karakter (1.5 - 2 SMS boyutu) olmalı.

        İstenen Taslak Türleri:
        {", ".join(selected_types)}

        Çıktıyı TAM OLARAK aşağıdaki formatta ver (markdown yok, sadece ayırıcılarla ayrılmış içerik):
        """
        
        for t in selected_types:
            prompt += f"\n---{t.upper()}---\n[{t} Taslak İçeriği]"
            
        return prompt

    async def generate_campaign_drafts(self, data: SMSRequest) -> SMSResponse:
        print(f"DEBUG: Generating drafts for {data.website_url}")
        # Scrape website content
        scraped_data = await self.scraper.scrape_site_info(data.website_url)
        print(f"DEBUG: Scraped candidates: {scraped_data['candidates']}")
        
        # Determine the best phone number to use
        # Prioritize the number provided in the request (e.g. from customer record)
        best_phone = data.phone_number
        
        if not best_phone:
            print(f"DEBUG: No phone number in request, identifying from candidates: {scraped_data['candidates']}")
            try:
                identified_phone = await self.scraper.identify_best_phone(
                    data.website_url, 
                    scraped_data["info_text"], 
                    scraped_data["candidates"]
                )
                best_phone = identified_phone or "Belirtilmedi"
            except Exception as e:
                print(f"WARNING: Phone identification failed: {e}")
                best_phone = "Belirtilmedi"
        else:
            print(f"DEBUG: Using provided phone number: {best_phone}")
        
        print(f"DEBUG: Final contact phone used for SMS: {best_phone}")
        
        # Construct dynamic prompt
        prompt = self._construct_prompt(data, scraped_data["info_text"], best_phone)
        
        # Call Gemini with retry for 429
        print("DEBUG: Calling Gemini for drafts...")
        max_retries = 2
        for attempt in range(max_retries):
            try:
                generated_text = await self.client.generate_text(prompt)
                print(f"DEBUG: Generated text length: {len(generated_text) if generated_text else 0}")
                break
            except Exception as e:
                if "429" in str(e) and attempt < max_retries - 1:
                    print(f"DEBUG: 429 detected, retrying in 5s... (Attempt {attempt+1})")
                    await asyncio.sleep(5)
                else:
                    raise e
        
        # Parse Response
        drafts = self._parse_generated_text(generated_text)
        print(f"DEBUG: Parsed {len(drafts)} drafts")
        
        # Ensure we return at most the requested count
        return SMSResponse(drafts=drafts[:data.message_count])

    def _parse_generated_text(self, text: str) -> list[SMSDraft]:
        drafts = []
        try:
            parts = text.split("---")
            current_type = None
            
            # Map of possible types in uppercase to their display versions
            type_map = {t.upper(): t for t in self.draft_types}

            for part in parts:
                clean_part = part.strip()
                if not clean_part:
                    continue
                
                if clean_part in type_map:
                    current_type = type_map[clean_part]
                elif current_type:
                    drafts.append(SMSDraft(type=current_type, content=clean_part))
                    current_type = None
            
            if not drafts:
                drafts.append(SMSDraft(type="Genel", content=text))
                
        except Exception as e:
            print(f"Parsing error: {e}")
            drafts.append(SMSDraft(type="Hata", content="AI yanıtı ayrıştırılamadı. Ham veri: " + text[:100]))

        return drafts
