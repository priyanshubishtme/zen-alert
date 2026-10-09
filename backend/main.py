"""
main.py — FastAPI backend for ZenAlert demo.
Serves static frontend files and provides simulated JSON/SSE endpoints.

Local dev:  uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
Production: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
"""

import asyncio
import json
import os
import random
from datetime import datetime
from pathlib import Path
from queue import Queue

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from sse_starlette.sse import EventSourceResponse

# ── Import data module (works from both repo root and backend/) ──
try:
    from backend.data import sim, gateway_snapshot
except ImportError:
    from data import sim, gateway_snapshot

# ── Application ──────────────────────────────────────────────────
app = FastAPI(title="ZenAlert API", version="1.0.0")

# ── CORS ─────────────────────────────────────────────────────────
# In production, set the FRONTEND_ORIGINS environment variable to a
# comma-separated list of allowed origins.
# Example: FRONTEND_ORIGINS=https://zen-alert.vercel.app,https://yourdomain.com
_default_origins = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:8765",
    "http://127.0.0.1:8765",
    "http://localhost:8770",
    "http://127.0.0.1:8770",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

_env_origins = os.environ.get("FRONTEND_ORIGINS", "")
_extra_origins = [o.strip() for o in _env_origins.split(",") if o.strip()] if _env_origins else []

_allowed_origins = _extra_origins + _default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
)

# ── Health endpoint ──────────────────────────────────────────────
@app.get("/health")
async def health():
    """Health check for Render or any monitoring service."""
    return JSONResponse({
        "status": "healthy",
        "service": "zenalert-api",
        "version": "1.0.0",
    })

# ── Static files (for local development) ─────────────────────────
# When deployed on Render the frontend is served by Vercel.
# These mounts remain so local `uvicorn backend.main:app` still works.
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"

if FRONTEND_DIR.exists():
    if (FRONTEND_DIR / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR / "assets")), name="assets")
    if (FRONTEND_DIR / "css").exists():
        app.mount("/css", StaticFiles(directory=str(FRONTEND_DIR / "css")), name="css")
    if (FRONTEND_DIR / "js").exists():
        app.mount("/js", StaticFiles(directory=str(FRONTEND_DIR / "js")), name="js")

# ── HTML pages (local dev only) ──────────────────────────────────
@app.get("/", response_class=HTMLResponse)
async def index():
    return FileResponse(str(FRONTEND_DIR / "index.html"))

@app.get("/app", response_class=HTMLResponse)
@app.get("/app.html", response_class=HTMLResponse)
async def dashboard():
    return FileResponse(str(FRONTEND_DIR / "app.html"))

@app.get("/public-alert", response_class=HTMLResponse)
@app.get("/public-alert.html", response_class=HTMLResponse)
async def public_alert():
    return FileResponse(str(FRONTEND_DIR / "public-alert.html"))

@app.get("/simulation", response_class=HTMLResponse)
@app.get("/simulation.html", response_class=HTMLResponse)
async def simulation():
    return FileResponse(str(FRONTEND_DIR / "simulation.html"))

@app.get("/architecture", response_class=HTMLResponse)
@app.get("/architecture.html", response_class=HTMLResponse)
async def architecture():
    return FileResponse(str(FRONTEND_DIR / "architecture.html"))

@app.get("/manifest.json")
async def manifest():
    return FileResponse(str(FRONTEND_DIR / "manifest.json"))

@app.get("/favicon.svg")
async def favicon():
    return FileResponse(str(FRONTEND_DIR / "assets" / "favicon.svg"), media_type="image/svg+xml")


# ── API: Overview ─────────────────────────────────────────────
@app.get("/api/overview")
async def api_overview():
    return sim.overview()

# ── API: Incidents ────────────────────────────────────────────
@app.get("/api/incidents")
async def api_incidents():
    return sim.incidents

@app.get("/api/incidents/{inc_id}")
async def api_incident_detail(inc_id: int):
    inc = next((i for i in sim.incidents if i["id"] == inc_id), None)
    if not inc:
        raise HTTPException(404, "Incident not found")
    return inc

@app.post("/api/incidents/{inc_id}/acknowledge")
async def api_acknowledge(inc_id: int):
    result = sim.update_incident(inc_id, "acknowledge")
    if not result:
        raise HTTPException(404, "Incident not found")
    return {"ok": True, "incident": result}

@app.post("/api/incidents/{inc_id}/dispatch")
async def api_dispatch(inc_id: int):
    result = sim.update_incident(inc_id, "dispatch")
    if not result:
        raise HTTPException(404, "Incident not found")
    return {"ok": True, "incident": result}

@app.post("/api/incidents/{inc_id}/false-alarm")
async def api_false_alarm(inc_id: int):
    result = sim.update_incident(inc_id, "false-alarm")
    if not result:
        raise HTTPException(404, "Incident not found")
    return {"ok": True, "incident": result}

# ── API: Nodes ────────────────────────────────────────────────
@app.get("/api/nodes")
async def api_nodes():
    return sim.nodes_snapshot()

@app.get("/api/nodes/{node_id}/telemetry")
async def api_node_telemetry(node_id: str):
    return sim.node_telemetry_history(node_id)

# ── API: Analytics ────────────────────────────────────────────
@app.get("/api/analytics")
async def api_analytics():
    return sim.analytics()

# ── API: Gateway ──────────────────────────────────────────────
@app.get("/api/gateway")
async def api_gateway():
    return gateway_snapshot()

# ── API: Alert broadcast ─────────────────────────────────────
@app.post("/api/alerts/broadcast")
async def api_broadcast(payload: dict):
    now = datetime.now().strftime("%H:%M:%S")
    entry = {
        "time": now,
        "incident": payload.get("incident", "MANUAL"),
        "channel": payload.get("channel", "SMS + Push + Siren"),
        "group": payload.get("group", "All"),
        "status": "DELIVERED",
    }
    sim.add_delivery_log(entry)
    return {"ok": True, "entry": entry}

# ── API: Simulate events ─────────────────────────────────────
@app.post("/api/simulate/fire")
async def api_simulate_fire():
    conf = round(0.85 + random.random() * 0.12, 2)
    inc = sim.create_incident(
        "Forest Fire / Smoke", "critical",
        "N-BHW-007", "Bhowali Forest Edge", conf
    )
    return {"ok": True, "incident": inc}

@app.post("/api/simulate/gas")
async def api_simulate_gas():
    conf = round(0.66 + random.random() * 0.15, 2)
    inc = sim.create_incident(
        "Gas Leakage / Combustible", "high",
        "N-BHW-004", "Roadside Cluster", conf
    )
    return {"ok": True, "incident": inc}

# ── API: SSE stream ──────────────────────────────────────────
@app.get("/api/stream")
async def api_stream():
    q = Queue()
    sim.sse_queues.append(q)

    async def event_generator():
        try:
            while True:
                # Check for queued messages
                try:
                    msg = q.get_nowait()
                    yield {"event": "message", "data": msg}
                except Exception:
                    pass

                # Periodic telemetry tick
                if random.random() < 0.3:
                    sim.telemetry_tick()

                await asyncio.sleep(1.5)
        finally:
            if q in sim.sse_queues:
                sim.sse_queues.remove(q)

    return EventSourceResponse(event_generator())

# ── Delivery log ──────────────────────────────────────────────
@app.get("/api/delivery-log")
async def api_delivery_log():
    return sim.delivery_log
