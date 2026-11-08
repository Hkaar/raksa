"""Public contracts for user-confirmed reports and follow-up observations."""

from typing import Annotated, Literal
from uuid import UUID

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, StrictBool, StringConstraints

ReportText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=10000)]
ShortText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]
StoragePath = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=1024)]


class Contract(BaseModel):
    model_config = ConfigDict(extra='forbid')


class Location(Contract):
    latitude: float = Field(ge=-90, le=90, allow_inf_nan=False, strict=True)
    longitude: float = Field(ge=-180, le=180, allow_inf_nan=False, strict=True)


class AnimalInfo(Contract):
    species: ShortText | None = None
    ownership: Literal['owned', 'stray', 'unknown'] = 'unknown'
    vaccination_status: Literal['reported_vaccinated', 'reported_unvaccinated', 'unknown'] = 'unknown'
    photo_path: StoragePath | None = None
    vaccination_card_path: StoragePath | None = None


class CaseCreate(Contract):
    story: ReportText
    occurred_at: AwareDatetime | None = None
    location: Location | None = None
    animal: AnimalInfo = Field(default_factory=AnimalInfo)
    bleeding_reported: StrictBool | None = Field(
        default=None,
        description='Jawaban pengguna. null berarti belum diketahui. Video tanpa darah terlihat tidak mengisi nilai ini sebagai false.',
    )


class CaseRead(CaseCreate):
    id: UUID
    created_at: AwareDatetime
    status: Literal['reported', 'in_review', 'observing', 'closed']


class ObservationCreate(Contract):
    observed_at: AwareDatetime
    notes: ReportText


class ObservationRead(ObservationCreate):
    id: UUID
    case_id: UUID
    created_at: AwareDatetime
