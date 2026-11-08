"""Best-effort visual clues; never a clinical assessment."""

from typing import Annotated, Literal, get_args

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

BodyPart = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=80)]

ReportedEvent = Literal['dog_bite', 'other_animal_contact', 'fall', 'unknown']
VisibleFeature = Literal[
    'puncture_like_marks', 'abrasion_like_area', 'irregular_open_edges',
    'crust_like_area', 'redness',
]
VISIBLE_FEATURES = list(get_args(VisibleFeature))


class WoundScanSuggestion(BaseModel):
    model_config = ConfigDict(extra='forbid')

    video_quality: Literal['usable', 'poor']
    body_part: BodyPart | None
    blood_visibility: Literal['visible', 'not_visible', 'unclear']
    wound_count: int | None = Field(strict=True, ge=1, le=20)
    visible_features: list[VisibleFeature] = Field(default_factory=list, max_length=5)


class WoundScanResponse(BaseModel):
    mode: Literal['ai', 'manual']
    suggestion: WoundScanSuggestion | None
    needs_confirmation: Literal[True] = True
    reason: Literal['ai_unavailable', 'video_unclear'] | None = None
