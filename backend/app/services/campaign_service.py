from datetime import datetime
from typing import List, Optional
from firebase_admin import firestore
from app.models.campaign_models import (
    Campaign, CampaignCreate, CampaignUpdate, 
    SavedMessage, SavedMessageCreate, CampaignStatus
)

class CampaignService:
    def __init__(self):
        self.db = firestore.client()
        self.collection = self.db.collection("campaigns")

    async def create_campaign(self, campaign_data: CampaignCreate, user_id: str) -> Campaign:
        """
        Create a new campaign in Firestore.
        """
        doc_ref = self.collection.document()
        campaign_id = doc_ref.id

        campaign_dict = campaign_data.model_dump()
        campaign_dict.update({
            "id": campaign_id,
            "user_id": user_id,
            "status": CampaignStatus.TASLAK.value,
            "created_at": datetime.now()
        })

        doc_ref.set(campaign_dict)
        return Campaign(**campaign_dict)

    def get_campaigns(self, user_id: str, customer_id: Optional[str] = None) -> List[Campaign]:
        """
        Get all campaigns belonging to a specific user, optionally filtered by customer.
        """
        query = self.collection.where("user_id", "==", user_id)
        
        if customer_id:
            query = query.where("customer_id", "==", customer_id)
            
        docs = query.order_by("created_at", direction=firestore.Query.DESCENDING).stream()
        return [Campaign(**doc.to_dict()) for doc in docs]

    def get_campaign(self, campaign_id: str, user_id: str) -> Optional[Campaign]:
        """
        Get a specific campaign by ID, ensuring it belongs to the user.
        """
        doc_ref = self.collection.document(campaign_id)
        doc = doc_ref.get()
        
        if doc.exists:
            data = doc.to_dict()
            if data.get("user_id") == user_id:
                return Campaign(**data)
        return None

    def update_campaign(self, campaign_id: str, campaign_data: CampaignUpdate, user_id: str) -> Optional[Campaign]:
        """
        Update an existing campaign's information.
        """
        doc_ref = self.collection.document(campaign_id)
        doc = doc_ref.get()
        
        if not doc.exists or doc.to_dict().get("user_id") != user_id:
            return None

        update_data = campaign_data.model_dump(exclude_unset=True)
        if not update_data:
            return Campaign(**doc.to_dict())

        # If status is being updated, ensure it's a string
        if "status" in update_data and isinstance(update_data["status"], CampaignStatus):
            update_data["status"] = update_data["status"].value

        doc_ref.update(update_data)
        return Campaign(**doc_ref.get().to_dict())

    def delete_campaign(self, campaign_id: str, user_id: str) -> bool:
        """
        Delete a campaign and its saved messages from Firestore.
        """
        doc_ref = self.collection.document(campaign_id)
        doc = doc_ref.get()
        
        if not doc.exists or doc.to_dict().get("user_id") != user_id:
            return False
            
        # Delete saved messages subcollection first
        messages_ref = doc_ref.collection("saved_messages")
        messages = messages_ref.stream()
        for msg in messages:
            msg.reference.delete()
            
        # Delete campaign doc
        doc_ref.delete()
        return True

    async def save_message(self, campaign_id: str, message_data: SavedMessageCreate, user_id: str) -> Optional[SavedMessage]:
        """
        Save an AI-generated message to the campaign's saved_messages subcollection.
        """
        campaign_ref = self.collection.document(campaign_id)
        campaign_doc = campaign_ref.get()
        
        if not campaign_doc.exists or campaign_doc.to_dict().get("user_id") != user_id:
            return None
            
        message_ref = campaign_ref.collection("saved_messages").document()
        message_id = message_ref.id
        
        message_dict = message_data.model_dump()
        message_dict.update({
            "id": message_id,
            "campaign_id": campaign_id,
            "created_at": datetime.now()
        })
        
        message_ref.set(message_dict)
        return SavedMessage(**message_dict)

    def get_saved_messages(self, campaign_id: str, user_id: str) -> List[SavedMessage]:
        """
        Get all saved messages for a specific campaign.
        """
        campaign_ref = self.collection.document(campaign_id)
        campaign_doc = campaign_ref.get()
        
        if not campaign_doc.exists or campaign_doc.to_dict().get("user_id") != user_id:
            return []
            
        docs = campaign_ref.collection("saved_messages").order_by("created_at", direction=firestore.Query.DESCENDING).stream()
        return [SavedMessage(**doc.to_dict()) for doc in docs]

    def delete_saved_message(self, campaign_id: str, message_id: str, user_id: str) -> bool:
        """
        Delete a specific saved message from a campaign.
        """
        campaign_ref = self.collection.document(campaign_id)
        campaign_doc = campaign_ref.get()
        
        if not campaign_doc.exists or campaign_doc.to_dict().get("user_id") != user_id:
            return False
            
        msg_ref = campaign_ref.collection("saved_messages").document(message_id)
        if msg_ref.get().exists:
            msg_ref.delete()
            return True
        return False
