from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class CampaignStatus(str, Enum):
    TASLAK = "Taslak"
    AKTIF = "Aktif"
    PLANLANDI = "Planlandı"
    TAMAMLANDI = "Tamamlandı"

class CampaignBase(BaseModel):
    name: str
    start_date: datetime
    end_date: datetime
    products: List[str]
    discount_rate: Optional[float] = 0.0

class CampaignCreate(CampaignBase):
    customer_id: str

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    products: Optional[List[str]] = None
    discount_rate: Optional[float] = None
    status: Optional[CampaignStatus] = None

class Campaign(CampaignBase):
    id: str
    customer_id: str
    user_id: str
    status: CampaignStatus = CampaignStatus.TASLAK
    created_at: datetime

    class Config:
        from_attributes = True

class SavedMessageBase(BaseModel):
    content: str
    target_audience: str

class SavedMessageCreate(SavedMessageBase):
    pass

class SavedMessage(SavedMessageBase):
    id: str
    campaign_id: str
    created_at: datetime

    class Config:
        from_attributes = True
