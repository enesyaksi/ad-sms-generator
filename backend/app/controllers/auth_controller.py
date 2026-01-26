from fastapi import APIRouter, Depends, Request
from app.middleware.auth_middleware import verify_firebase_token, get_current_user
from app.models.user_models import TokenVerifyRequest, AuthResponse, UserProfile

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/verify-token", response_model=AuthResponse)
async def verify_token(request: Request):
    """
    Verify a Firebase ID token and return user profile.
    The token should be sent in the Authorization header as a Bearer token.
    """
    decoded_token = await verify_firebase_token(request)
    user_profile = UserProfile(**decoded_token)
    return AuthResponse(user=user_profile)

@router.get("/user", response_model=UserProfile)
async def get_user(user: dict = Depends(get_current_user)):
    """
    Get the currently authenticated user's profile.
    Requires a valid Firebase ID token in the Authorization header.
    """
    return UserProfile(**user)
