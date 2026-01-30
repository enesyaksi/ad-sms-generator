from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional, Dict, Any
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

@router.get("/analytics/weekly-trend", response_model=Dict[str, Any])
async def get_weekly_trend(
    user: dict = Depends(get_current_user)
):
    """
    Get weekly message production trend for the authenticated user.
    Returns message counts aggregated by day for the last 7 days.
    """
    return campaign_service.get_weekly_trend(user["uid"])

@router.get("/analytics/campaign-stats", response_model=Dict[str, Any])
async def get_campaign_stats(
    user: dict = Depends(get_current_user)
):
    """
    Get campaign statistics including growth trend.
    Compares this month's campaign count vs last month's.
    """
    return campaign_service.get_campaign_stats(user["uid"])

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

@router.post("/{campaign_id}/messages", response_model=SavedMessage, status_code=status.HTTP_201_CREATED)
async def save_message(
    campaign_id: str,
    message_data: SavedMessageCreate,
    user: dict = Depends(get_current_user)
):
    """
    Save an AI-generated SMS message to a campaign.
    """
    message = await campaign_service.save_message(campaign_id, message_data, user["uid"])
    if not message:
        raise HTTPException(status_code=404, detail="Campaign not found or unauthorized")
    return message

@router.get("/{campaign_id}/messages", response_model=List[SavedMessage])
async def list_saved_messages(
    campaign_id: str,
    user: dict = Depends(get_current_user)
):
    """
    List all saved messages for a specific campaign.
    """
    return campaign_service.get_saved_messages(campaign_id, user["uid"])

@router.delete("/{campaign_id}/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_message(
    campaign_id: str,
    message_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Delete a saved message from a campaign.
    """
    success = campaign_service.delete_saved_message(campaign_id, message_id, user["uid"])
    if not success:
        raise HTTPException(status_code=404, detail="Message/Campaign not found or unauthorized")
    return None
