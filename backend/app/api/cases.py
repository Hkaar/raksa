from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import ValidationError
from app.api.officer_auth import me
from app.schemas import CaseCreate, CaseRead, ObservationCreate, ObservationRead
from app.services.persistence import PersistenceError, insert_row

router = APIRouter(tags=['cases'])


def persist(settings, table, row, output):
    try:
        result = insert_row(settings, table, row)
        # Database rows contain internal fields not exposed by this contract.
        return output.model_validate({k: v for k, v in result.items() if k in output.model_fields})
    except PersistenceError as exc:
        raise HTTPException(status_code=exc.status, detail={'code': exc.code}) from None
    except ValidationError:
        raise HTTPException(status_code=502, detail={'code': 'persistence_response_invalid'}) from None


@router.post('/cases', response_model=CaseRead, status_code=201)
def create_case(payload: CaseCreate, request: Request, response: Response):
    """Citizen report; returns only the row just created, without public read access."""
    response.headers['Cache-Control'] = 'no-store'
    return persist(request.app.state.settings, 'cases', payload.model_dump(mode='json'), CaseRead)


@router.post('/cases/{case_id}/observations', response_model=ObservationRead, status_code=201)
def create_observation(case_id: UUID, payload: ObservationCreate, request: Request, response: Response,
                       officer: dict = Depends(me)):
    """Authenticated officers append animal follow-up records; owner access is deferred."""
    response.headers['Cache-Control'] = 'no-store'
    row = payload.model_dump(mode='json') | {'case_id': str(case_id), 'source': 'officer'}
    return persist(request.app.state.settings, 'observations', row, ObservationRead)
