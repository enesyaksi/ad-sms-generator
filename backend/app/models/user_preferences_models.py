from pydantic import BaseModel
from typing import Dict, Optional
from datetime import datetime

class UserPreferences(BaseModel):
    user_id: str
    preferred_tones: Dict[str, float] = {}  # Tone name -> weight (0.0 - 1.0)
    avg_message_length: int = 150
    emoji_usage_rate: float = 0.0 # 0.0 - 1.0 (frequency of emoji usage)
    total_saved_messages: int = 0
    updated_at: datetime
