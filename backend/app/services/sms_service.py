import httpx
import re
from bs4 import BeautifulSoup
from app.clients.gemini_client import GeminiClient
from app.models.request_models import SMSRequest
from app.models.response_models import SMSResponse, SMSDraft
import asyncio

class SMSService:
    def __init__(self):
        self.client = GeminiClient()
        self.draft_types = [
            "Klasik", "Acil", "Samimi", "Minimalist", 
            "Hikaye Odaklı", "Soru & Cevap", "Modern", 
            "Lüks", "Genç", "Vurucu"
        ]

    async def _scrape_website(self, url: str) -> dict:
        scraped_data = {
            "info_text": "Web sitesi içeriği alınamadı.",
            "phone_number": "Belirtilmedi"
        }
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Extract phone numbers using regex
                    # This regex seeks common Turkish and international formats
                    phone_pattern = r'(?:\+90|0)?\s?[2-9]\d{2}\s?\d{3}\s?\d{2}\s?\d{2}'
                    text_content = soup.get_text()
                    phones = re.findall(phone_pattern, text_content)
                    if phones:
                        # Take the first unique one
                        scraped_data["phone_number"] = list(set(phones))[0].strip()

                    # Extract meta description and title
                    title = soup.title.string if soup.title else ""
                    meta_desc = ""
                    meta_tag = soup.find("meta", attrs={"name": "description"})
                    if meta_tag:
                        meta_desc = meta_tag.get("content", "")
                    
                    # Extract some body text (first 1000 chars)
                    for script in soup(["script", "style"]):
                        script.decompose()
                    body_text = soup.get_text(separator=' ', strip=True)[:1000]
                    
                    scraped_data["info_text"] = f"Başlık: {title}\nDescription: {meta_desc}\nİçerik Özeti: {body_text}"
        except Exception as e:
            print(f"Scraping error: {e}")
        return scraped_data

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
        # Scrape website content
        scraped_data = await self._scrape_website(data.website_url)
        
        # Construct dynamic prompt
        prompt = self._construct_prompt(data, scraped_data["info_text"], scraped_data["phone_number"])
        
        # Call Gemini
        generated_text = await self.client.generate_text(prompt)
        
        # Parse Response
        drafts = self._parse_generated_text(generated_text)
        
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
