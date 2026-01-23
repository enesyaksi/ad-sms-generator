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
            "candidates": []
        }
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True, headers=headers) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # 1. Collect tel: links
                    candidates = []
                    for link in soup.find_all("a", href=True):
                        if link["href"].startswith("tel:"):
                            candidates.append(link["href"].replace("tel:", "").strip())

                    # 2. Extract using regex
                    phone_pattern = r'((?:\+90|0?)\s?\(?[2-9]\d{2}\)?\s?\d{3}\s?\d{2}\s?\d{2})|(444\s?\d{4})|(0850\s?\d{3}\s?\d{2}\s?\d{2})'
                    text_content = soup.get_text()
                    for match in re.finditer(phone_pattern, text_content):
                        num = match.group().strip()
                        if len(re.sub(r'\D', '', num)) >= 7:
                            candidates.append(num)
                    
                    scraped_data["candidates"] = list(set(candidates))

                    # Extract meta and body
                    title = soup.title.string if soup.title else ""
                    meta_desc = ""
                    meta_tag = soup.find("meta", attrs={"name": "description"})
                    if meta_tag:
                        meta_desc = meta_tag.get("content", "")
                    
                    for script in soup(["script", "style"]):
                        script.decompose()
                    body_text = soup.get_text(separator=' ', strip=True)[:5000]
                    
                    scraped_data["info_text"] = f"Başlık: {title}\nDescription: {meta_desc}\nİçerik Özeti: {body_text}"
        except Exception as e:
            print(f"Scraping error: {e}")
        return scraped_data

    async def _identify_best_phone(self, url: str, text: str, candidates: list) -> str:
        if not candidates:
            return "Belirtilmedi"
            
        prompt = f"""
        You are working inside a real backend service.
        Your task is to identify the **most reliable general contact phone number** for a website.

        ---
        ## Context
        * Website URL: {url}
        * You are given:
          1. Raw visible text extracted from the website
          2. A list of phone number candidates found via regex, `tel:` links, and structured data

        This website belongs to a **business**, and we want the **primary contact phone number** that would normally appear in:
        * Footer
        * Contact / İletişim page
        * Customer service section

        ---
        ## Extracted Website Text (truncated)
        {text[:3000]}

        ---
        ## Phone Number Candidates
        {", ".join(candidates)}

        ---
        ## Rules (VERY IMPORTANT)
        * DO NOT guess or invent a phone number
        * DO NOT generate example or placeholder numbers
        * DO NOT infer based on country, domain name, or language alone
        * Choose a phone number ONLY IF:
          * It is clearly presented as a contact / customer service / communication number
        * If multiple numbers exist:
          * Prefer the most general customer contact number
          * Avoid branch-specific, personal, or WhatsApp-only numbers
        * If none of the candidates can be confidently identified as a general contact number, return **null**

        ---
        ## Output Format (STRICT)
        Return ONLY valid JSON. No explanation. No markdown.
        ```json
        {{
          "phone": "+90XXXXXXXXXX" | null
        }}
        ```
        """
        
        result = await self.client.generate_json(prompt)
        return result.get("phone") or "Belirtilmedi"

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
        scraped_data = await self._scrape_website(data.website_url)
        print(f"DEBUG: Scraped candidates: {scraped_data['candidates']}")
        
        # New AI-powered identification
        best_phone = await self._identify_best_phone(
            data.website_url, 
            scraped_data["info_text"], 
            scraped_data["candidates"]
        )
        print(f"DEBUG: AI identified best phone: {best_phone}")
        
        # Construct dynamic prompt
        prompt = self._construct_prompt(data, scraped_data["info_text"], best_phone)
        
        # Call Gemini
        print("DEBUG: Calling Gemini for drafts...")
        generated_text = await self.client.generate_text(prompt)
        print(f"DEBUG: Generated text length: {len(generated_text) if generated_text else 0}")
        
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
