# backend/app/schemas/suggestion/suggestion_schema.py
from pydantic import BaseModel
from typing import List, Optional

class SuggestionResponse(BaseModel):
    results: List[str]

class RefintCodproSuggestion(BaseModel):
    refint: str
    cod_pro: int
