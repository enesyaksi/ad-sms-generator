from fastapi import APIRouter, HTTPException
from app.models.request_models import SMSRequest
from app.models.response_models import SMSResponse
from app.services.sms_service import SMSService

router = APIRouter()
sms_service = SMSService()

@router.post("/generate-sms", response_model=SMSResponse)
async def generate_sms(request: SMSRequest):
    try:
        return await sms_service.generate_campaign_drafts(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
