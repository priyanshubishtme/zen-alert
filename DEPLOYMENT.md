# ZenAlert — Deployment Guide

Production architecture: **Render** serves both the FastAPI backend and static frontend from a single web service.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Deploy on Render](#step-1-deploy-on-render)
4. [Step 2: Configure Environment Variables](#step-2-configure-environment-variables)
5. [Step 3: Verify the Deployment](#step-3-verify-the-deployment)
6. [Local Development](#local-development)
7. [Environment Variables Reference](#environment-variables-reference)
8. [3D Map Setup (MapLibre GL + OpenFreeMap Tiles)](#3d-map-setup-maplibre-gl--openfreemap-tiles)
9. [Storage and Persistence Limitations](#storage-and-persistence-limitations)
10. [Future Hardware Integration Notes](#future-hardware-integration-notes)

---

## Architecture Overview

```
                    USERS
                      |
                      v
             YOUR RENDER DOMAIN
        (e.g. zenalert-api.onrender.com)
                      |
                      v
              RENDER WEB SERVICE
        FastAPI + Uvicorn (Python)
        Serves static frontend files
                      |
            +---------+---------+
            |         |         |
            v         v         v
         Sensors   Incidents  Analytics
            |
            v
      Future Hardware Integration
      ESP32 / LoRa / MQTT / Edge AI
```

FastAPI serves both the `/api/*` endpoints **and** the static frontend (HTML + CSS + JS) from a single Render web service. No separate hosting needed.

---

## Prerequisites

- A [GitHub](https://github.com) account with this repository pushed
- A free [Render](https://render.com) account
- Python 3.11+ (for local development)

---

## Step 1: Deploy on Render

### Option A: Blueprint (Recommended)

1. Push this repository to GitHub.
2. Go to [Render Dashboard → Blueprints](https://dashboard.render.com/blueprints).
3. Click **New Blueprint Instance**.
4. Connect your GitHub repository.
5. Render will detect `render.yaml` and create the service automatically.
6. Review the settings and click **Apply**.

### Option B: Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com/) → **New** → **Web Service**.
2. Connect your GitHub repository.
3. Configure:

| Setting            | Value                                          |
|--------------------|------------------------------------------------|
| **Name**           | `zenalert-api`                                 |
| **Region**         | Your preferred region                          |
| **Runtime**        | Python                                         |
| **Root Directory** | `backend`                                      |
| **Build Command**  | `pip install -r requirements.txt`              |
| **Start Command**  | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Health Check**   | `/health`                                      |
| **Plan**           | Free or Starter                                |

4. Click **Create Web Service**.

### After Deployment

1. Wait for the build to complete and the service to show **Live**.
2. Note your Render URL — it will look like:
   ```
   https://zenalert-api.onrender.com
   ```
3. Verify the health endpoint:
   ```
   https://YOUR-SERVICE.onrender.com/health
   ```
   Expected response:
   ```json
   {"status": "healthy", "service": "zenalert-api", "version": "1.0.0"}
   ```
4. Verify the API docs:
   ```
   https://YOUR-SERVICE.onrender.com/docs
   ```
5. Open the landing page:
   ```
   https://YOUR-SERVICE.onrender.com/
   ```

---

## Step 2: Configure Environment Variables

### In the Render Dashboard

1. Go to your `zenalert-api` service → **Environment**.
2. Add or update:

| Key                | Value                                                   |
|--------------------|---------------------------------------------------------|
| `FRONTEND_ORIGINS` | `https://zenalert-api.onrender.com`                    |

Set this to your **actual Render URL** (comma-separated if you have custom domains). This controls CORS — since the frontend and backend are on the same origin, this is mainly needed if you ever access the API from another domain.

3. Click **Save Changes** — Render will redeploy automatically.

### Examples

Single Render deployment (same-origin, CORS not strictly needed but good practice):
```
FRONTEND_ORIGINS=https://zenalert-api.onrender.com
```

Render + custom domain:
```
FRONTEND_ORIGINS=https://zenalert-api.onrender.com,https://zenalert.yourdomain.com
```

> **Note:** Local development origins (`http://localhost:8000`, `http://127.0.0.1:8000`, etc.) are always included automatically and do not need to be added to `FRONTEND_ORIGINS`.

---

## Step 3: Verify the Deployment

### Backend Verification

1. **Health check:**
   ```
   GET https://YOUR-SERVICE.onrender.com/health
   → {"status": "healthy", "service": "zenalert-api", "version": "1.0.0"}
   ```

2. **API docs:**
   ```
   GET https://YOUR-SERVICE.onrender.com/docs
   → Swagger UI
   ```

3. **API endpoint:**
   ```
   GET https://YOUR-SERVICE.onrender.com/api/overview
   → JSON with nodes_online, open_incidents, etc.
   ```

### Frontend Verification

1. Open your Render URL (`https://YOUR-SERVICE.onrender.com/`).
2. Open the browser developer console (F12 → Console).
3. You should see: `[ZenAlert] API base: https://YOUR-SERVICE.onrender.com`
4. Check the Network tab — API requests should go to the same origin and return 200.

### Checklist

- [ ] Render service is **Live** and `/health` returns `{"status": "healthy"}`
- [ ] Landing page loads at the Render URL root (`/`)
- [ ] Dashboard (`/app.html`) loads and shows node/incident data
- [ ] LIVE/DEMO mode toggle works
- [ ] Incident modal opens and actions (acknowledge, dispatch, false alarm) work
- [ ] Sensors & Air Quality page shows charts
- [ ] Device Health page shows the 16-node table
- [ ] Analytics page renders charts
- [ ] English/Hindi toggle works on both landing and dashboard
- [ ] Dark/Light theme toggle works
- [ ] Simulation page (`/simulation.html`) loads the 3D scene and NORMAL/FIRE TEST/CLEAR work
- [ ] MapLibre GL map renders with OpenFreeMap dark vector tiles on the Live Map page
- [ ] Connection status shows "Online" when the backend is reachable
- [ ] DEMO mode continues to work when the backend is down

---

## Local Development

Run the backend from the repository root:

```powershell
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Open in browser:
- Landing page: `http://127.0.0.1:8000/`
- Dashboard: `http://127.0.0.1:8000/app.html`
- Simulation: `http://127.0.0.1:8000/simulation.html`

The frontend `api.js` automatically detects local development and uses `http://127.0.0.1:8000` as the API base.

If you run the frontend separately (e.g., VS Code Live Server on port 5500), the API base also auto-detects and points to `http://127.0.0.1:8000`.

---

## Environment Variables Reference

### Backend (Render)

| Variable           | Required | Description                                                       |
|--------------------|----------|-------------------------------------------------------------------|
| `FRONTEND_ORIGINS` | Optional | Comma-separated list of allowed CORS origins (your Render URL)    |
| `PORT`             | Auto     | Provided by Render automatically — do not set manually            |
| `PYTHON_VERSION`   | Optional | Python version for Render (default: 3.11.9 via `render.yaml`)    |

### Frontend (Code)

| Configuration           | Location                   | Description                        |
|-------------------------|----------------------------|------------------------------------|
| `PRODUCTION_API_URL`    | `frontend/js/api.js:24`   | Render backend URL (hardcoded)     |
| `window.ZENALERT_API_BASE` | HTML `<script>` tag    | Runtime override (takes priority)  |

> **Note:** Since both frontend and backend are served from the same Render service, the frontend auto-detects the API base as same-origin. You usually don't need to change these unless you split the services later.

---

## 3D Map Setup (MapLibre GL + OpenFreeMap Tiles)

The dashboard's **Live Threat Map** uses [MapLibre GL JS](https://maplibre.org/) for interactive 2.5D/3D map rendering. Here's how it works and what APIs are involved:

### What We Use

| Component           | Provider    | API Key Required? | Cost    |
|---------------------|-------------|-------------------|---------|
| **Map renderer**    | MapLibre GL JS (v3.6.2) | ❌ No       | Free / Open Source |
| **Base map tiles**  | OpenFreeMap Dark (vector) | ❌ No  | Free (public CDN)  |
| **3D simulation**   | Three.js (v0.128.0)   | ❌ No         | Free / Open Source |

### No API Keys Required

The current setup requires **zero API keys**:

- **MapLibre GL JS** is an open-source map library loaded from CDN (`unpkg.com/maplibre-gl@3.6.2`).
- **OpenFreeMap Dark tiles** are served from OpenFreeMap's public CDN (`tiles.openfreemap.org`) with no authentication needed. These are vector tiles based on OpenStreetMap data.
- **Three.js** is used for the sensor-node 3D simulation scene and is also loaded from CDN.

### How the Map Works

The map is configured in [`frontend/js/map.js`](frontend/js/map.js):

```javascript
// Tile source — free OpenFreeMap dark vector tiles, no API key needed
style: 'https://tiles.openfreemap.org/styles/dark'
```

The map initializes with:
- **Center**: Nainital/Bhowali area (`[79.5059, 29.3947]`)
- **Pitch**: 45° (gives the 3D perspective effect)
- **Bearing**: -10° (slight rotation)
- **Zoom**: 12.5

### Map Features

- **Sensor node markers** — colored by status (critical/high/watch/normal/offline)
- **Risk zone polygons** — semi-transparent red fill with dashed outline
- **Popups** — click a node marker to see its ID, zone, and status
- **Layer toggles** — show/hide nodes and zones from the dashboard UI
- **Fly-to** — animated camera transitions to incident locations

### Switching to Vector Tiles (Optional, for better 3D)

If you want true 3D terrain or vector tiles with labels, you would need a tile provider with an API key:

| Provider       | Free Tier              | API Key |
|----------------|------------------------|---------|
| **MapTiler**   | 100K tiles/month free  | Yes — get at [maptiler.com](https://www.maptiler.com/cloud/) |
| **Stadia Maps**| 200K tiles/month free  | Yes — get at [stadiamaps.com](https://stadiamaps.com/)       |
| **Mapbox**     | 200K tiles/month free  | Yes — get at [mapbox.com](https://www.mapbox.com/)           |

To switch, update the `style` in `map.js` from inline raster config to a vector style URL:
```javascript
style: 'https://api.maptiler.com/maps/streets-v2-dark/style.json?key=YOUR_API_KEY'
```

For the current demo, **no changes or API keys are needed** — it works out of the box.

---

## Storage and Persistence Limitations

> **Important:** The current backend stores all data **in-memory**.

This means:

- **All incidents, delivery logs, and simulation state reset on every Render restart or redeploy.**
- There is no database, no file-based persistence, and no external storage.
- This is by design for the current demo/presentation prototype.

### What This Means for Production

On Render's free tier, your service will spin down after ~15 minutes of inactivity and cold-start on the next request. All in-memory data resets on spin-down.

### Recommended Future Improvements

For a production deployment with real data persistence:

1. **PostgreSQL** — Render offers managed PostgreSQL. Store incidents, delivery logs, and node configuration.
2. **Redis** — For real-time telemetry caching and SSE message queues.
3. **SQLite** — Only suitable for development; Render's filesystem is ephemeral.

No database migration or ORM has been added to avoid introducing unnecessary complexity for the current demo stage.

---

## Future Hardware Integration Notes

The current backend simulates all sensor telemetry, incidents, and gateway data. For production hardware integration:

| Component                | Current State       | Production Requirement                             |
|--------------------------|---------------------|----------------------------------------------------|
| Sensor telemetry         | Simulated in-memory | MQTT broker + ESP32 LoRa nodes                     |
| Camera verification      | Simulated           | Edge gateway with camera module + YOLOv8           |
| AI fusion scores         | Random values       | CNN-LSTM model on NVIDIA Jetson                    |
| Incident detection       | Manual simulation   | Threshold-based + AI pipeline                      |
| Alert delivery (SMS)     | Logged only         | Twilio / AWS SNS / BSNL API integration            |
| Alert delivery (Siren)   | Logged only         | GPIO-controlled local siren via ESP32              |
| LoRa mesh                | Not connected       | SX1278 LoRa modules + mesh routing firmware        |
| Persistent storage       | In-memory           | PostgreSQL / TimescaleDB for time-series            |
| Background MQTT consumer | Not implemented     | Separate worker process or Render Background Worker |

A production hardware deployment would require:
- A persistent MQTT broker (e.g., Mosquitto on a VPS or HiveMQ Cloud)
- A Render Background Worker or separate service for the MQTT consumer
- Database migrations for persistent incident and telemetry storage
- Authentication for the dashboard and API

None of these have been added to keep the current deployment simple and functional for the SIH demo.
