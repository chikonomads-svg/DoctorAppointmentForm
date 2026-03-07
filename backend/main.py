"""
main.py
-------
FastAPI application entry point for the Prescription Form backend.

Run with:
    cd Form_web
    uvicorn backend.main:app --reload --port 8000

API docs available at:
    http://localhost:8000/docs      (Swagger UI)
    http://localhost:8000/redoc     (ReDoc)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import init_db
from routes.prescriptions import router as prescription_router
from routes.medicine import router as medicine_router
from routes.ocr import router as ocr_router
from routes.auth import router as auth_router
from routes.csv_medicine import router as csv_medicine_router
from routes.dashboard import router as dashboard_router

# ── App setup ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Prescription Form API",
    description="Backend for Dr. Deepak Kumar's digital prescription form.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS (allows the HTML frontend served from file:// or localhost to call API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # In production, restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Database init on startup ──────────────────────────────────────────────────

@app.on_event("startup")
def startup():
    init_db()


# ── Routes ────────────────────────────────────────────────────────────────────

app.include_router(prescription_router)
app.include_router(medicine_router)
app.include_router(ocr_router)
app.include_router(auth_router)
app.include_router(csv_medicine_router)
app.include_router(dashboard_router)


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
def health():
    return JSONResponse({"status": "ok", "service": "prescription-api"})


@app.get("/", tags=["System"])
def root():
    return JSONResponse({
        "message": "Prescription Form API is running.",
        "docs": "/docs",
        "health": "/health",
    })
