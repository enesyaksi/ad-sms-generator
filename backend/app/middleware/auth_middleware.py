from fastapi import Request, HTTPException, Depends
from firebase_admin import auth
import firebase_admin

async def verify_firebase_token(request: Request):
    """
    Middleware/Dependency to verify Firebase ID tokens in the Authorization header.
    Expected format: Authorization: Bearer <token>
    """
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid authentication token"
        )
    
    token = auth_header.split(" ")[1]
    
    try:
        # Verify the ID token while checking if the token is revoked
        decoded_token = auth.verify_id_token(token, check_revoked=True)
        # Attach user information to the request state
        request.state.user = decoded_token
        return decoded_token
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Expired token")
    except auth.RevokedIdTokenError:
        raise HTTPException(status_code=401, detail="Revoked token")
    except firebase_admin.exceptions.FirebaseError as e:
        raise HTTPException(status_code=401, detail=f"Authentication error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Authentication failed")

async def get_current_user(decoded_token: dict = Depends(verify_firebase_token)):
    """
    Dependency to get the current user from the verified token.
    """
    return decoded_token
