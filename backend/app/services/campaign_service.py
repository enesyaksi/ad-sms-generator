from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
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
            
        # Remove order_by to avoid index requirements
        docs = query.stream()
        campaigns = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            campaigns.append(Campaign(**data))
        
        # Sort in-memory
        campaigns.sort(key=lambda x: x.created_at, reverse=True)
        return campaigns

    def check_and_update_statuses(self):
        """
        Check all Planned and Active campaigns and update their status based on start/end dates.
        Run this method via a background scheduler.
        """
        print(f"[{datetime.now()}] Checking campaign statuses...")
        
        # Fetch only relevant campaigns to minimize reads
        # Note: 'in' query supports up to 10 values
        statuses_to_check = [CampaignStatus.PLANLANDI.value, CampaignStatus.AKTIF.value]
        docs = self.collection.where("status", "in", statuses_to_check).stream()
        
        today = datetime.now().date()
        updates_count = 0
        
        for doc in docs:
            data = doc.to_dict()
            campaign_id = doc.id
            status = data.get("status")
            
            # Handle start_date/end_date which might be datetime or string depending on ingestion
            # Assuming they are stored as Firestore Timestamps or Datetime objects
            # If stored as YYYY-MM-DD string, we parse.
            start_date_raw = data.get("start_date")
            end_date_raw = data.get("end_date")
            
            if not start_date_raw or not end_date_raw:
                continue
                
            # Helper to convert to date
            try:
                if isinstance(start_date_raw, str):
                    start_date = datetime.strptime(start_date_raw.split('T')[0], "%Y-%m-%d").date()
                else:
                    # Firestore Timestamp or datetime
                    start_date = start_date_raw.date()
                    
                if isinstance(end_date_raw, str):
                    end_date = datetime.strptime(end_date_raw.split('T')[0], "%Y-%m-%d").date()
                else:
                    end_date = end_date_raw.date()
            except Exception as e:
                print(f"Error parsing dates for campaign {campaign_id}: {e}")
                continue

            new_status = None
            
            # Logic:
            # Planlandı -> Aktif (if Today >= Start Date)
            if status == CampaignStatus.PLANLANDI.value:
                if today >= start_date:
                    new_status = CampaignStatus.AKTIF.value
            
            # Aktif -> Tamamlandı (if Today > End Date)
            elif status == CampaignStatus.AKTIF.value:
                if today > end_date:
                    new_status = CampaignStatus.TAMAMLANDI.value
            
            if new_status:
                print(f"Updating campaign {campaign_id}: {status} -> {new_status}")
                self.collection.document(campaign_id).update({"status": new_status})
                updates_count += 1
                
        print(f"[{datetime.now()}] Status check complete. Updated {updates_count} campaigns.")

    def get_campaign(self, campaign_id: str, user_id: str) -> Optional[Campaign]:
        """
        Get a specific campaign by ID, ensuring it belongs to the user.
        """
        doc_ref = self.collection.document(campaign_id)
        doc = doc_ref.get()
        
        if doc.exists:
            data = doc.to_dict()
            if data.get("user_id") == user_id:
                data["id"] = doc.id
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
        
        # Immediate Activation Check
        # If user sets status to "Planlandı", check if it should already be "Aktif"
        if update_data.get("status") == CampaignStatus.PLANLANDI.value:
            current_data = doc.to_dict()
            # Get start_date from update (if changed) or existing doc
            start_date_raw = update_data.get("start_date") or current_data.get("start_date")
            
            if start_date_raw:
                try:
                    today = datetime.now().date()
                    if isinstance(start_date_raw, str):
                        start_date = datetime.strptime(start_date_raw.split('T')[0], "%Y-%m-%d").date()
                    else:
                        start_date = start_date_raw.date()
                        
                    if today >= start_date:
                        print(f"Immediate activation triggered for campaign {campaign_id}")
                        update_data["status"] = CampaignStatus.AKTIF.value
                except Exception as e:
                    print(f"Error checking date for immediate activation: {e}")

        doc_ref.update(update_data)
        updated_doc = doc_ref.get()
        data = updated_doc.to_dict()
        data["id"] = updated_doc.id
        return Campaign(**data)

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
        messages = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            messages.append(SavedMessage(**data))
        return messages

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

    def get_campaign_stats(self, user_id: str) -> Dict[str, Any]:
        """
        Get campaign statistics including growth trend.
        Compares this month's campaign count vs last month's.
        """
        campaigns = self.get_campaigns(user_id)
        total_campaigns = len(campaigns)
        
        # Get current month and last month boundaries
        today = datetime.now()
        first_of_this_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        first_of_last_month = (first_of_this_month - timedelta(days=1)).replace(day=1)
        
        # Count campaigns by month
        # Count campaigns by month
        this_month_count = 0
        
        for campaign in campaigns:
            created_at = campaign.created_at
            if created_at:
                # Convert to naive datetime if timezone-aware
                if hasattr(created_at, 'tzinfo') and created_at.tzinfo is not None:
                    created_at = created_at.replace(tzinfo=None)
                
                if created_at >= first_of_this_month:
                    this_month_count += 1
        
        # Calculate trend percentage (Growth relative to previous total)
        # Previous Total = Total Now - Created This Month
        previous_total = total_campaigns - this_month_count
        
        trend = None
        trend_label = None
        
        if previous_total > 0:
            change = (this_month_count / previous_total) * 100
            trend = f"+{int(change)}%"
            trend_label = "Geçen aya göre artış"
        elif total_campaigns > 0:
             # All campaigns created this month
            trend = "+100%"
            trend_label = "Bu ay oluşturuldu"
        # If no campaigns at all, trend stays None
        
        return {
            "total_campaigns": total_campaigns,
            "this_month_count": this_month_count,
            "trend": trend,
            "trend_label": trend_label
        }

    def get_weekly_trend(self, user_id: str) -> Dict[str, Any]:
        """
        Get weekly message production trend for the user.
        Aggregates saved messages by day for the last 7 days.
        """
        # Turkish day names (short form)
        day_names = {
            0: "Pzt",
            1: "Sal",
            2: "Çar",
            3: "Per",
            4: "Cum",
            5: "Cmt",
            6: "Paz"
        }
        
        # Calculate date range (current week, Monday to Sunday)
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        # Get Monday of the current week (weekday() returns 0 for Monday)
        monday = today - timedelta(days=today.weekday())
        
        # Initialize counts for each day of the week (Mon-Sun)
        daily_counts: Dict[str, int] = {}
        for i in range(7):
            date = monday + timedelta(days=i)
            date_str = date.strftime("%Y-%m-%d")
            daily_counts[date_str] = 0
        
        # Get all campaigns for the user
        campaigns = self.get_campaigns(user_id)
        
        # Aggregate message counts by day
        for campaign in campaigns:
            campaign_ref = self.collection.document(campaign.id)
            messages = campaign_ref.collection("saved_messages").stream()
            
            for msg in messages:
                msg_data = msg.to_dict()
                created_at = msg_data.get("created_at")
                if created_at:
                    # Handle both datetime objects and Firestore timestamps
                    if hasattr(created_at, 'date'):
                        msg_date = created_at.date()
                    else:
                        msg_date = created_at
                    
                    msg_date_str = msg_date.strftime("%Y-%m-%d") if hasattr(msg_date, 'strftime') else str(msg_date)[:10]
                    
                    if msg_date_str in daily_counts:
                        daily_counts[msg_date_str] += 1
        
        # Build trend data
        trend = []
        for i in range(7):
            date = monday + timedelta(days=i)
            date_str = date.strftime("%Y-%m-%d")
            count = daily_counts.get(date_str, 0)
            trend.append({
                "date": date_str,
                "day_name": day_names[date.weekday()],
                "count": count
            })
        
        # Calculate totals
        total_weekly = sum(daily_counts.values())
        
        # Find most productive day
        most_productive_day = "—"
        max_count = 0
        for item in trend:
            if item["count"] > max_count:
                max_count = item["count"]
                most_productive_day = item["day_name"]
        
        return {
            "trend": trend,
            "total_weekly": total_weekly,
            "most_productive_day": most_productive_day
        }
