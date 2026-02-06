from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from enum import Enum

class RefinementType(str, Enum):
    SHORTEN = "SHORTEN"
    CLARIFY = "CLARIFY"
    MORE_EXCITING = "MORE_EXCITING"
    MORE_FORMAL = "MORE_FORMAL"

class SMSRequest(BaseModel):
    website_url: str
    products: List[str]
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    discount_rate: int
    message_count: int = 10
    target_audience: str
    phone_number: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "website_url": "https://myshop.com",
                "products": ["Summer Dress", "Beach Towel"],
                "start_date": "2024-06-01",
                "end_date": "2024-06-30",
                "discount_rate": 25,
                "message_count": 3,
                "target_audience": "Gençler, Moda Severler"
            }
        }

class RefineRequest(BaseModel):
    content: str
    refinement_type: RefinementType
