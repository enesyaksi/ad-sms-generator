from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any

class TokenVerifyRequest(BaseModel):
    id_token: str

class UserProfile(BaseModel):
    uid: str
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None
    auth_time: int
    firebase: Dict[str, Any]

class AuthResponse(BaseModel):
    user: UserProfile
    message: str = "Authentication successful"
