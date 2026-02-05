from fastapi import APIRouter, HTTPException, Depends
from app.middleware.auth_middleware import get_current_user
from app.models.request_models import SMSRequest, RefineRequest
from app.models.response_models import SMSResponse, SMSDraft
from app.services.sms_service import SMSService

router = APIRouter()
sms_service = SMSService()

@router.post("/generate-sms", response_model=SMSResponse)
async def generate_sms(request: SMSRequest, user: dict = Depends(get_current_user)):
    try:
        return await sms_service.generate_campaign_drafts(request, user["uid"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/refine-sms", response_model=SMSDraft)
async def refine_sms(request: RefineRequest, user: dict = Depends(get_current_user)):
    try:
        return await sms_service.refine_sms_draft(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
