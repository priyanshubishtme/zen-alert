# ZenAlert — Deployment Guide

Production architecture: **Vercel** (frontend) ↔ **Render** (FastAPI backend).

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Step 1: Deploy Backend on Render](#step-1-deploy-backend-on-render)
3. [Step 2: Configure Frontend for Production](#step-2-configure-frontend-for-production)
4. [Step 3: Configure CORS on Render](#step-3-configure-cors-on-render)
5. [Step 4: Verify the Deployment](#step-4-verify-the-deployment)
6. [Local Development](#local-development)
7. [Environment Variables Reference](#environment-variables-reference)
8. [Storage and Persistence Limitations](#storage-and-persistence-limitations)
9. [Future Hardware Integration Notes](#future-hardware-integration-notes)

---

## Architecture Overview

```
                    USERS
                      |
                      v
               YOUR VERCEL DOMAIN
          (e.g. zen-alert.vercel.app)
                      |
                      v
                   VERCEL
           Static HTML/CSS/JS frontend
                      |
                      | HTTPS API requests
                      |
                      v
              RENDER WEB SERVICE
           FastAPI + Uvicorn (Python)
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

The frontend is a static site (HTML + CSS + JS modules) deployed on Vercel.  
The backend is a FastAPI application deployed on Render.  
They communicate over HTTPS via the `/api/*` endpoints.

---

## Step 1: Deploy Backend on Render

### Option A: Blueprint (Recommended)

1. Push this repository to GitHub (if not already).
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
4. Verify the API docs (if not disabled):
   ```
   https://YOUR-SERVICE.onrender.com/docs
   ```

---

## Step 2: Configure Frontend for Production

The frontend needs to know where the backend is. There are **two options** (use one):

### Option A: Edit `api.js` (Simplest)

Open `frontend/js/api.js` and set the `PRODUCTION_API_URL` constant (around line 22):

```javascript
const PRODUCTION_API_URL = 'https://zenalert-api.onrender.com';
```

Replace with your actual Render URL. **No trailing slash.**

Commit and push. Vercel will automatically redeploy.

### Option B: Inline Script Tag (No Code Changes)

In each HTML file that loads `api.js` (`index.html`, `app.html`), add a `<script>` tag **before** the module script:

```html
<script>
  window.ZENALERT_API_BASE = 'https://zenalert-api.onrender.com';
</script>
```

This takes priority over the `PRODUCTION_API_URL` constant.

### Vercel Project Settings

Your existing Vercel project settings should remain unchanged:

| Setting              | Value               |
|----------------------|---------------------|
| **Framework Preset** | Other               |
| **Root Directory**   | `frontend`          |
| **Build Command**    | _(leave empty)_     |
| **Output Directory** | `.` (or `frontend`) |

If your Vercel project is configured to deploy from the repository root with `frontend` as the output directory, keep that configuration. The key change is updating `PRODUCTION_API_URL` in `api.js`, then pushing to trigger a new Vercel deployment.

---

## Step 3: Configure CORS on Render

The backend must allow requests from your Vercel frontend. Set the `FRONTEND_ORIGINS` environment variable on Render.

### In the Render Dashboard

1. Go to your `zenalert-api` service → **Environment**.
2. Add or update:

| Key               | Value                                                          |
|--------------------|----------------------------------------------------------------|
| `FRONTEND_ORIGINS` | `https://zen-alert.vercel.app,https://yourdomain.com`         |

Replace with your **actual** Vercel URL and any custom domains (comma-separated, no spaces, no trailing slashes).

3. Click **Save Changes** — Render will redeploy automatically.

### Examples

Single Vercel deployment:
```
FRONTEND_ORIGINS=https://zen-alert.vercel.app
```

Vercel + custom domain:
```
FRONTEND_ORIGINS=https://zen-alert.vercel.app,https://zenalert.yourdomain.com
```

Vercel + preview deployments (use a pattern in your code if needed):
```
FRONTEND_ORIGINS=https://zen-alert.vercel.app,https://zen-alert-git-main-youruser.vercel.app
```

> **Note:** Local development origins (`http://localhost:8000`, `http://127.0.0.1:8000`, etc.) are always included automatically and do not need to be added to `FRONTEND_ORIGINS`.

---

## Step 4: Verify the Deployment

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

1. Open your Vercel URL.
2. Open the browser developer console (F12 → Console).
3. You should see: `[ZenAlert] API base: https://YOUR-SERVICE.onrender.com`
4. Check the Network tab — API requests should go to your Render URL and return 200.

### Checklist

- [ ] Render service is **Live** and `/health` returns `{"status": "healthy"}`
- [ ] `FRONTEND_ORIGINS` is set on Render with your Vercel URL
- [ ] `PRODUCTION_API_URL` in `api.js` is set to your Render URL
- [ ] Vercel has been redeployed after the `api.js` change
- [ ] Landing page loads and shows live stats from the API
- [ ] Dashboard (`/app.html`) loads and shows node/incident data
- [ ] LIVE/DEMO mode toggle works
- [ ] Incident modal opens and actions (acknowledge, dispatch, false alarm) work
- [ ] Sensors & Air Quality page shows charts
- [ ] Device Health page shows the 16-node table
- [ ] Analytics page renders charts
- [ ] English/Hindi toggle works on both landing and dashboard
- [ ] Dark/Light theme toggle works
- [ ] Simulation page (`/simulation.html`) loads the 3D scene and NORMAL/FIRE TEST/CLEAR work
- [ ] Connection status shows "Online" when the backend is reachable
- [ ] Offline banner appears when the backend is unreachable
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

| Variable          | Required | Description                                                    |
|-------------------|----------|----------------------------------------------------------------|
| `FRONTEND_ORIGINS` | Yes      | Comma-separated list of allowed CORS origins (Vercel URLs)     |
| `PORT`            | Auto     | Provided by Render automatically — do not set manually         |
| `PYTHON_VERSION`  | Optional | Python version for Render (default: 3.11.9 via `render.yaml`) |

### Frontend (Vercel / Code)

| Configuration           | Location                   | Description                        |
|-------------------------|----------------------------|------------------------------------|
| `PRODUCTION_API_URL`    | `frontend/js/api.js:22`   | Render backend URL (hardcoded)     |
| `window.ZENALERT_API_BASE` | HTML `<script>` tag    | Runtime override (takes priority)  |

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
