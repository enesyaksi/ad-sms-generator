from pydantic import BaseModel, HttpUrl
from typing import List, Optional

class SMSRequest(BaseModel):
    website_url: str
    phone_number: str
    products: List[str]
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    discount_rate: int
    
    # Placeholder for future file handling
    target_audience_file: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "website_url": "https://myshop.com",
                "phone_number": "+123456789",
                "products": ["Summer Dress", "Beach Towel"],
                "start_date": "2024-06-01",
                "end_date": "2024-06-30",
                "discount_rate": 25
            }
        }
