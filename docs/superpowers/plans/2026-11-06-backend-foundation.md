# Backend Foundation Implementation Plan

Use superpowers:executing-plans for inline implementation.

## Goal
Deliver a runnable local FastAPI foundation and validated case/observation contracts.

## Architecture
Python 3.10+, Pydantic v2, settings from environment, versioned routers. Persistence remains disabled until authorization is defined. Supabase schema is documented for the next stage.

## Spec
The approved design from the conversation, copied to ../specs/2026-11-06-raksa-backend-design.md.

## Global constraints
- Cases contain animal information. Observations refer to a case UUID.
- Optional photos and vaccination cards. Unknown bleeding stays unknown.
- AI suggestions require confirmation. Clinical rules await professional validation.
- Credentials remain server-side. No public case access.

## Review focus
Check missing and invalid fields, timezone handling, accidental claim of persistence, sensitive validation errors, and configuration without credentials.

### Task 1: Runnable API
- [x] Write tests for health, OpenAPI, configurable CORS and environment loading.
- [x] Run `.venv/Scripts/python -m pytest tests/test_app.py -q`. Expected missing app failure.
- [x] Implement app/main.py, app/config.py and health router. GET /api/v1/health reports process health only.
- [x] Run the same test command. Expected pass.

### Task 2: Case and observation contracts
Consumes create_app from Task 1. Produces CaseCreate, CaseRead, ObservationCreate, ObservationRead and versioned write route contracts.
- [x] Write request tests for optional media, unknown bleeding, whitespace, invalid UUID/time/location and unavailable persistence. Check validation responses omit submitted sensitive values.
- [x] Run `.venv/Scripts/python -m pytest tests/test_contracts.py -q`. Expected missing routes/models failure.
- [x] Implement Pydantic contracts and routes returning 503 with a stable code until persistence is implemented. Document proposed tables and setup instructions.
- [x] Run `.venv/Scripts/python -m pytest -q`. Expected all pass.
- [x] Fresh reviewer checks all files, then verify fixes and record evidence.
