import httpx
import os
import uuid
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from firebase_admin import storage
import firebase_admin

class LogoExtractionService:
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

    async def extract_logo_from_url(self, website_url: str) -> str:
        """
        Scrape website HTML to identify and return the logo URL.
        Searches for og:image, favicons, and images with "logo" in class/id/alt.
        """
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True, headers=self.headers) as client:
                response = await client.get(website_url)
                if response.status_code != 200:
                    print(f"Failed to fetch {website_url}: {response.status_code}")
                    return None
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # 1. Check Open Graph Image (common for brand logos)
                og_image = soup.find("meta", property="og:image")
                if og_image and og_image.get("content"):
                    return urljoin(website_url, og_image.get("content"))
                
                # 2. Check for Favicons
                icon_link = soup.find("link", rel=lambda x: x and 'icon' in x.lower())
                if icon_link and icon_link.get("href"):
                    return urljoin(website_url, icon_link.get("href"))
                
                # 3. Check for <img> tags with "logo" in class, id, or alt
                logo_img = soup.find("img", {
                    "class": lambda x: x and 'logo' in x.lower(),
                }) or soup.find("img", {
                    "id": lambda x: x and 'logo' in x.lower(),
                }) or soup.find("img", {
                    "alt": lambda x: x and 'logo' in x.lower(),
                })
                
                if logo_img and logo_img.get("src"):
                    return urljoin(website_url, logo_img.get("src"))
                
                # 4. Fallback: Search all images for anything with "logo" in the filename
                for img in soup.find_all("img", src=True):
                    if 'logo' in img["src"].lower():
                        return urljoin(website_url, img["src"])

        except Exception as e:
            print(f"Logo extraction error for {website_url}: {e}")
        
        return None

    async def download_and_store_logo(self, logo_url: str, customer_id: str) -> str:
        """
        Download logo image and store it in Firebase Storage.
        Returns the public URL of the stored logo.
        """
        if not logo_url:
            return None

        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True, headers=self.headers) as client:
                response = await client.get(logo_url)
                if response.status_code != 200:
                    print(f"Failed to download logo from {logo_url}: {response.status_code}")
                    return None
                
                content_type = response.headers.get("Content-Type", "image/png")
                # Extract extension from content type or URL
                ext = content_type.split("/")[-1] if "/" in content_type else "png"
                if len(ext) > 4: ext = "png" # Sanity check for long extensions
                
                filename = f"logos/{customer_id}_{uuid.uuid4().hex[:8]}.{ext}"
                
                # Get the default bucket
                bucket = storage.bucket()
                blob = bucket.blob(filename)
                
                # Upload the image content
                blob.upload_from_string(
                    response.content,
                    content_type=content_type
                )
                
                # Make the blob public
                blob.make_public()
                
                return blob.public_url

        except Exception as e:
            print(f"Error storing logo for customer {customer_id}: {e}")
        
        return None
