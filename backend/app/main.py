from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import os
from app.config.firebase_config import initialize_firebase
from app.core.limiter import limiter
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler
from app.services.campaign_service import CampaignService

# Initialize Firebase Admin SDK before importing controllers
initialize_firebase()

# Scheduler Setup
scheduler = BackgroundScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Schedule the status check job
    campaign_service = CampaignService()
    
    # Run immediately on startup
    scheduler.add_job(campaign_service.check_and_update_statuses, 'date')
    
    # Run every hour
    scheduler.add_job(campaign_service.check_and_update_statuses, 'interval', hours=1)
    
    scheduler.start()
    print("Scheduler started: Campaign status automation active (Immediate check triggered).")
    yield
    # Shutdown
    scheduler.shutdown()
    print("Scheduler shut down.")

from app.controllers.sms_controller import router as sms_router
from app.controllers.auth_controller import router as auth_router
from app.controllers.customer_controller import router as customer_router
from app.controllers.campaign_controller import router as campaign_router
from app.exceptions.api_exceptions import register_exceptions

app = FastAPI(
    title="AdManager SMS Generator",
    description="Generate SMS marketing drafts using Google Gemini AI",
    version="1.0.0",
    lifespan=lifespan
)

# Initialize Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS configuration
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    origins = allowed_origins_env.split(",")
else:
    origins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sms_router)
app.include_router(auth_router)
app.include_router(customer_router)
app.include_router(campaign_router)
register_exceptions(app)

@app.get("/")
async def root():
    return {"message": "AdManager SMS Generator API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
