from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.api.cases import router as cases_router
from app.api.health import router as health_router
from app.api.scans import router as scans_router
from app.config import Settings


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()
    application = FastAPI(title=settings.app_name, version='0.1.0')
    application.state.settings = settings
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=['GET', 'POST'],
        allow_headers=['Authorization', 'Content-Type'],
    )
    application.include_router(health_router, prefix='/api/v1')
    application.include_router(cases_router, prefix='/api/v1')
    application.include_router(scans_router, prefix='/api/v1')

    @application.exception_handler(RequestValidationError)
    async def validation_error_handler(request, exc: RequestValidationError):
        # Avoid echoing patient narratives or other submitted values in errors.
        errors = [{'loc': error['loc'], 'type': error['type']} for error in exc.errors()]
        return JSONResponse(status_code=422, content={'detail': errors})

    return application


app = create_app()
