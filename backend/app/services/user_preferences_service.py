from datetime import datetime
from typing import Dict, Any, Optional
from firebase_admin import firestore
from app.models.user_preferences_models import UserPreferences
from app.models.campaign_models import SavedMessage

class UserPreferencesService:
    def __init__(self):
        self.db = firestore.client()
        self.collection = self.db.collection("user_preferences")

    def get_preferences(self, user_id: str) -> UserPreferences:
        """
        Get user preferences from Firestore. If not exists, return default.
        """
        doc_ref = self.collection.document(user_id)
        doc = doc_ref.get()

        if doc.exists:
            data = doc.to_dict()
            # Convert timestamp to datetime if needed (though Pydantic handles it usually)
            return UserPreferences(**data)
        
        # Return default preferences
        return UserPreferences(
            user_id=user_id,
            updated_at=datetime.now()
        )

    def update_from_saved_message(self, user_id: str, message: SavedMessage, tone: str) -> None:
        """
        Update user preferences based on a newly saved message.
        Analyzes message traits (length, emojis) and updates rolling averages.
        """
        prefs = self.get_preferences(user_id)
        
        # 1. Analyze Message
        content_length = len(message.content)
        has_emoji = self._contains_emoji(message.content)
        
        # 2. Update Stats (Incremental Average)
        n = prefs.total_saved_messages
        new_n = n + 1
        
        # Update Average Length
        new_avg_length = int(((prefs.avg_message_length * n) + content_length) / new_n)
        
        # Update Emoji Usage Rate
        emoji_score = 1.0 if has_emoji else 0.0
        new_emoji_rate = ((prefs.emoji_usage_rate * n) + emoji_score) / new_n
        
        # Update Tone Preferences
        # Increase weight for the selected tone
        current_tones = prefs.preferred_tones.copy()
        current_weight = current_tones.get(tone, 0.0)
        # Simple reinforcement: increase by 0.1, cap at 1.0, decay others slightly?
        # Let's use frequency-based probability: (count of tone / total messages)
        # But we don't store count of each tone.
        # Alternative: Moving average for weights.
        
        # Let's just track "Tone Affinity".
        # Increase current tone by 0.05
        new_weight = min(current_weight + 0.05, 1.0)
        current_tones[tone] = new_weight
        
        # Update Model
        prefs.avg_message_length = new_avg_length
        prefs.emoji_usage_rate = new_emoji_rate
        prefs.preferred_tones = current_tones
        prefs.total_saved_messages = new_n
        prefs.updated_at = datetime.now()
        
        # 3. Save to Firestore
        self.collection.document(user_id).set(prefs.model_dump())
        print(f"DEBUG: Updated preferences for user {user_id}: {prefs.model_dump()}")

    def _contains_emoji(self, text: str) -> bool:
        # Simple check for common emoji ranges or use a library if available.
        # For now, let's assume if it has non-ascii characters that are symbol-like?
        # Better: basic range check.
        # Quick heuristic for this MVP:
        for char in text:
            if ord(char) > 0x1F600 and ord(char) < 0x1F64F: # Emoticons
                return True
            if ord(char) > 0x1F300 and ord(char) < 0x1F5FF: # Misc Symbols and Pictographs
                return True
        return False
