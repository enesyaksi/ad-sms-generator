from pydantic import BaseModel
from typing import List

class SMSDraft(BaseModel):
    type: str  # Short, Urgent, Friendly
    content: str

class SMSResponse(BaseModel):
    drafts: List[SMSDraft]
