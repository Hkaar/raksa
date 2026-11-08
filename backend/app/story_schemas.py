"""Unconfirmed narrative assistance; never clinical classification."""
from typing import Annotated, Literal
from pydantic import BaseModel, ConfigDict, Field, StrictBool, StringConstraints

Text = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=10000)]
Short = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]

class Contract(BaseModel):
    model_config = ConfigDict(extra='forbid')

class StoryInput(Contract):
    story: Text

class Transcript(Contract):
    transcript: Text | None
    language: Literal['id', 'en', 'unknown']

class StorySuggestion(Contract):
    time_text: Short | None
    place_text: Short | None
    animal_species: Short | None
    event_type: Literal['bite', 'scratch', 'lick', 'other'] | None
    body_part: Short | None
    bleeding_reported: StrictBool | None

class TranscriptionResponse(Contract):
    mode: Literal['ai', 'manual']
    transcript: Text | None = None
    language: Literal['id', 'en', 'unknown'] = 'unknown'
    needs_confirmation: Literal[True] = True
    reason: Literal['ai_unavailable', 'audio_unclear'] | None = None

class ExtractionResponse(Contract):
    mode: Literal['ai', 'manual']
    suggestion: StorySuggestion | None = None
    needs_confirmation: Literal[True] = True
    reason: Literal['ai_unavailable'] | None = None
