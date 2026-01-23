import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    # Warning or Error - for now just print
    print("WARNING: GEMINI_API_KEY not found in environment variables.")
