from pydantic import BaseModel
from typing import List

class SMSDraft(BaseModel):
    type: str
    content: str
    score: int
    is_recommended: bool = False

class SMSResponse(BaseModel):
    drafts: List[SMSDraft]
