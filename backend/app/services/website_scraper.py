import httpx
import re
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
from app.clients.gemini_client import GeminiClient

class WebsiteScraper:
    def __init__(self):
        self.client = GeminiClient()
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

    async def scrape_site_info(self, url: str) -> dict:
        """
        Fetch website content and extract phone candidates and info text.
        """
        scraped_data = {
            "info_text": "Web sitesi içeriği alınamadı.",
            "candidates": []
        }
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True, headers=self.headers) as client:
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

    async def identify_best_phone(self, url: str, text: str, candidates: list) -> str:
        """
        Use AI to identify the best contact phone number from candidates.
        """
        if not candidates:
            return None
            
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
        * Choose a phone number ONLY IF it is likely a valid contact number.
        * If multiple exist, prefer the general contact number.
        * Return ONLY valid JSON.

        ---
        ## Output Format
        ```json
        {{
          "phone": "+90XXXXXXXXXX" | null
        }}
        ```
        """
        try:
            result = await self.client.generate_json(prompt)
            return result.get("phone")
        except Exception:
            return None
