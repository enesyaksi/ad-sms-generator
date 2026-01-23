import httpx
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

    async def _scrape_website(self, url: str) -> str:
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
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
                    
                    return f"Başlık: {title}\nDescription: {meta_desc}\nİçerik Özeti: {body_text}"
        except Exception as e:
            print(f"Scraping error: {e}")
        return "Web sitesi içeriği alınamadı."

    def _construct_prompt(self, data: SMSRequest, scraped_info: str) -> str:
        products_str = ", ".join(data.products)
        count = min(max(data.message_count, 1), 10)
        selected_types = self.draft_types[:count]
        
        prompt = f"""
        Profesyonel bir SMS pazarlama metin yazarı olarak hareket et.
        Bir kampanya için TAM OLARAK {count} farklı Türkçe SMS taslağı oluştur.
        
        Kampanya Detayları:
        - Web Sitesi: {data.website_url}
        - Ürünler: {products_str}
        - İndirim Oranı: %{data.discount_rate}
        - Başlangıç Tarihi: {data.start_date or 'Belirtilmedi'}
        - Bitiş Tarihi: {data.end_date or 'Belirtilmedi'}
        - Hedef Kitle: {data.target_audience}
        
        Web Sitesinden Alınan Ek Bilgiler:
        {scraped_info}

        ZORUNLU KURALLAR:
        1. Her bir taslak MUTLAKA "{data.website_url}" adresini içermelidir.
        2. Metinler akıcı olmalı.
        3. Kampanya tarihlerini ve indirim oranını metne doğal bir şekilde yedir.
        4. Tarih belirtirken MUTLAKA yılı da ekle (Örn: 29.01.2026 veya 29 Ocak 2026). Sadece gün/ay yazma.
        5. Hedef kitleye ({data.target_audience}) uygun bir dil kullan.
        6. Her mesaj yaklaşık 250 karakter (1.5 - 2 SMS boyutu) olmalı.

        İstenen Taslak Türleri:
        {", ".join(selected_types)}

        Çıktıyı TAM OLARAK aşağıdaki formatta ver (markdown yok, sadece ayırıcılarla ayrılmış içerik):
        """
        
        for t in selected_types:
            prompt += f"\n---{t.upper()}---\n[{t} Taslak İçeriği]"
            
        return prompt

    async def generate_campaign_drafts(self, data: SMSRequest) -> SMSResponse:
        # Scrape website content
        scraped_info = await self._scrape_website(data.website_url)
        
        # Construct dynamic prompt
        prompt = self._construct_prompt(data, scraped_info)
        
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
