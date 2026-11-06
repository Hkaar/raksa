from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.schemas import CaseCreate, CaseRead, ObservationCreate, ObservationRead

router = APIRouter(tags=['cases'])
UNAVAILABLE = {
    'code': 'persistence_not_configured',
    'message': 'Penyimpanan kasus belum tersedia. Laporan belum tersimpan.',
}


@router.post('/cases', response_model=CaseRead, status_code=201,
             responses={503: {'description': 'Persistence and authorization pending'}})
def create_case(payload: CaseCreate) -> CaseRead:
    """Kontrak pelaporan tahap awal. Saat ini selalu mengembalikan 503 untuk input valid."""
    raise HTTPException(status_code=503, detail=UNAVAILABLE)


@router.post('/cases/{case_id}/observations', response_model=ObservationRead, status_code=201,
             responses={503: {'description': 'Persistence and authorization pending'}})
def create_observation(case_id: UUID, payload: ObservationCreate) -> ObservationRead:
    """Kontrak observasi tahap awal. Saat ini selalu mengembalikan 503 untuk input valid."""
    raise HTTPException(status_code=503, detail=UNAVAILABLE)
