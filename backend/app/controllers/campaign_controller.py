from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from app.models.campaign_models import (
    Campaign, CampaignCreate, CampaignUpdate, 
    SavedMessage, SavedMessageCreate
)
from app.services.campaign_service import CampaignService
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/campaigns", tags=["campaigns"])
campaign_service = CampaignService()

@router.post("/", response_model=Campaign, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    campaign_data: CampaignCreate,
    user: dict = Depends(get_current_user)
):
    """
    Create a new campaign for the authenticated user.
    """
    return await campaign_service.create_campaign(campaign_data, user["uid"])

@router.get("/", response_model=List[Campaign])
async def list_campaigns(
    customer_id: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    """
    List all campaigns belonging to the authenticated user.
    Optionally filter by customer_id.
    """
    try:
        return campaign_service.get_campaigns(user["uid"], customer_id)
    except Exception as e:
        if "FAILED_PRECONDITION" in str(e):
             raise HTTPException(
                status_code=500,
                detail="This query requires a Firestore index. Check the server logs for the creation link."
            )
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{campaign_id}", response_model=Campaign)
async def get_campaign(
    campaign_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Get details of a specific campaign.
    """
    campaign = campaign_service.get_campaign(campaign_id, user["uid"])
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@router.put("/{campaign_id}", response_model=Campaign)
async def update_campaign(
    campaign_id: str,
    campaign_data: CampaignUpdate,
    user: dict = Depends(get_current_user)
):
    """
    Update a campaign's information.
    """
    campaign = campaign_service.update_campaign(campaign_id, campaign_data, user["uid"])
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found or unauthorized")
    return campaign

@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_campaign(
    campaign_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Delete a campaign and its saved messages.
    """
    success = campaign_service.delete_campaign(campaign_id, user["uid"])
    if not success:
        raise HTTPException(status_code=404, detail="Campaign not found or unauthorized")
    return None
