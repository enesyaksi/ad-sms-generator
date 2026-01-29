from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime

class CustomerBase(BaseModel):
    name: str
    website_url: str
    phone_number: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    website_url: Optional[str] = None
    phone_number: Optional[str] = None
    logo_url: Optional[str] = None

class Customer(CustomerBase):
    id: str
    user_id: str
    logo_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
