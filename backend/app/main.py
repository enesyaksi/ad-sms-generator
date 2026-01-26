from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.controllers.sms_controller import router as sms_router
from app.controllers.auth_controller import router as auth_router
from app.exceptions.api_exceptions import register_exceptions
from app.config.firebase_config import initialize_firebase

# Initialize Firebase Admin SDK
initialize_firebase()

app = FastAPI(
    title="AdManager SMS Generator",
    description="Generate SMS marketing drafts using Google Gemini AI",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sms_router)
app.include_router(auth_router)
register_exceptions(app)

@app.get("/")
async def root():
    return {"message": "AdManager SMS Generator API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
