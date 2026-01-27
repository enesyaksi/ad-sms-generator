from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

def register_exceptions(app: FastAPI):
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        print(f"CRITICAL ERROR: {str(exc)}")  # Log internally
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error"},
        )
