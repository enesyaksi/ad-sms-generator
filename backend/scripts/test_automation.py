import asyncio
import os
import sys
from datetime import datetime

# Ensure backend directory is in path
sys.path.append(os.getcwd())

from app.config.firebase_config import initialize_firebase
from app.services.campaign_service import CampaignService
from app.models.campaign_models import CampaignCreate, CampaignStatus

# Initialize Firebase
initialize_firebase()

async def main():
    print("--- Starting Automation Verification ---")
    service = CampaignService()
    user_id = "test_auto_user"
    
    # 1. Test Case: Planned -> Active
    print("\n[Test 1] Testing Planned -> Active transition (Start Date = Today)")
    camp_data = CampaignCreate(
        name="Test Planned -> Active",
        customer_id="test_customer",
        products=["Test Product"],
        start_date=datetime.now(), # Today
        end_date=datetime.now(),
        discount_rate=0
    )
    
    # Create campaign (Async)
    camp = await service.create_campaign(camp_data, user_id)
    print(f"Created campaign {camp.id} (Status: {camp.status})")
    
    # Manually set to 'Planlandı' to simulate user scheduling
    service.collection.document(camp.id).update({"status": CampaignStatus.PLANLANDI.value})
    print("Set status to 'Planlandı'")
    
    # Run Automation Logic (Sync)
    print("Running check_and_update_statuses()...")
    service.check_and_update_statuses()
    
    # Verify result
    updated_camp = service.collection.document(camp.id).get()
    new_status = updated_camp.get("status")
    print(f"Result Status: {new_status}")
    
    if new_status == CampaignStatus.AKTIF.value:
        print("✅ SUCCESS: Transitioned to Active")
    else:
        print(f"❌ FAILURE: Expected Active, got {new_status}")

    # Cleanup
    service.collection.document(camp.id).delete()
    print("Cleaned up Test 1.")

if __name__ == "__main__":
    asyncio.run(main())
