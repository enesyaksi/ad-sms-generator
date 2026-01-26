from datetime import datetime
from typing import List, Optional
from firebase_admin import firestore
from app.models.customer_models import Customer, CustomerCreate, CustomerUpdate
from app.services.logo_extraction_service import LogoExtractionService
from app.services.website_scraper import WebsiteScraper

class CustomerService:
    def __init__(self):
        self.db = firestore.client()
        self.collection = self.db.collection("customers")
        self.logo_service = LogoExtractionService()
        self.scraper = WebsiteScraper()

    async def create_customer(self, customer_data: CustomerCreate, user_id: str) -> Customer:
        """
        Create a new customer in Firestore and automatically extract/store their logo and phone.
        """
        # Create a new document to get an ID
        doc_ref = self.collection.document()
        customer_id = doc_ref.id

        # Extract and store logo
        logo_url = await self.logo_service.extract_logo_from_url(customer_data.website_url)
        stored_logo_url = None
        if logo_url:
            stored_logo_url = await self.logo_service.download_and_store_logo(logo_url, customer_id)

        # Extract website info (phone candidates etc)
        scraped_data = await self.scraper.scrape_site_info(customer_data.website_url)
        extracted_phone = await self.scraper.identify_best_phone(
            customer_data.website_url,
            scraped_data["info_text"],
            scraped_data["candidates"]
        )

        customer_dict = customer_data.model_dump()
        
        # Auto-fill phone if provided data is empty but scraper found one
        if not customer_dict.get("phone_number") and extracted_phone:
            customer_dict["phone_number"] = extracted_phone

        customer_dict.update({
            "id": customer_id,
            "user_id": user_id,
            "logo_url": stored_logo_url or logo_url, # Fallback to original if storage failed
            "created_at": datetime.now()
        })

        # Save to Firestore
        doc_ref.set(customer_dict)
        
        return Customer(**customer_dict)

    def get_customers(self, user_id: str) -> List[Customer]:
        """
        Get all customers belonging to a specific user.
        """
        docs = self.collection.where("user_id", "==", user_id).order_by("created_at", direction=firestore.Query.DESCENDING).stream()
        return [Customer(**doc.to_dict()) for doc in docs]

    def get_customer(self, customer_id: str, user_id: str) -> Optional[Customer]:
        """
        Get a specific customer by ID, ensuring they belong to the user.
        """
        doc_ref = self.collection.document(customer_id)
        doc = doc_ref.get()
        
        if doc.exists:
            data = doc.to_dict()
            if data.get("user_id") == user_id:
                return Customer(**data)
        return None

    def update_customer(self, customer_id: str, customer_data: CustomerUpdate, user_id: str) -> Optional[Customer]:
        """
        Update an existing customer's information.
        """
        doc_ref = self.collection.document(customer_id)
        doc = doc_ref.get()
        
        if not doc.exists or doc.to_dict().get("user_id") != user_id:
            return None

        update_data = customer_data.model_dump(exclude_unset=True)
        if not update_data:
            return Customer(**doc.to_dict())

        doc_ref.update(update_data)
        
        # Return the updated customer
        return Customer(**doc_ref.get().to_dict())

    def delete_customer(self, customer_id: str, user_id: str) -> bool:
        """
        Delete a customer from Firestore.
        """
        doc_ref = self.collection.document(customer_id)
        doc = doc_ref.get()
        
        if doc.exists and doc.to_dict().get("user_id") == user_id:
            doc_ref.delete()
            return True
        return False
