from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AdManager SMS Generator",
    description="Generate SMS marketing drafts using Google Gemini AI",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AdManager SMS Generator API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
