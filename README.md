# ZenAlert — SIH26178 Early-Warning Dashboard Demo

A presentation-ready browser prototype for the ZenAlert environmental early-warning platform, with a FastAPI service, responsive dashboard, and focused sensor-node simulation.

## What is included

- Live Map control-room dashboard
- Simulated environmental sensor telemetry
- Multi-modal confidence / severity display
- Incident Center with search
- Sensors & Air page
- Device Health page for 16 nodes
- Alert Composer + delivery log
- Analytics & Reports view
- Admin / thresholds page
- Standalone Sensor Node Prototype with live fire-event simulation
- Dark / light mode
- English / Hindi toggle
- Online / Offline connection state
- Responsive layouts for desktop, laptop, tablet, and mobile

## Run

1. Install the Python dependencies used by the backend.
2. Start the backend from the repository root:

   ```powershell
   uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
   ```

3. Open `http://127.0.0.1:8000/` for the landing page and `http://127.0.0.1:8000/app.html` for the dashboard.
4. Use the dashboard's **Prototype** page for the embedded simulation, or open `http://127.0.0.1:8000/simulation.html?v=5` for the focused standalone prototype.
5. The standalone prototype intentionally has no “Back to Site” or “Open Dashboard” actions. It is a focused sensor-node lab view containing only the simulation, sensor controls, status display, and pipeline. The dashboard embed provides the separate **Open Fullscreen** action when a larger view is needed.
6. In the dashboard, **LIVE** uses the FastAPI service and **DEMO** uses sample data. Use **EN | हिं** for the language toggle and the moon icon for theme changes.

### Prototype controls

The standalone sensor-node prototype starts in a safe state:

- **NORMAL** restores baseline telemetry and clears the camera panel.
- **FIRE TEST** runs the complete event pipeline: sensor anomaly, camera verification, AI fusion, local alarm, LoRa transmission, and dashboard notification.
- **CLEAR** returns the simulation to its initial safe state.

The prototype header is intentionally compact and contains no navigation links. It is designed to work at laptop and mobile widths. On smaller screens, the 3D scene appears first and the sensor controls follow below it; the pipeline wraps into readable rows instead of forcing horizontal scrolling.

### Final prototype UX

- The standalone page opens directly into the sensor-node simulation.
- Navigation back to the landing page and dashboard is intentionally omitted to avoid competing actions.
- The dashboard's Prototype route remains the entry point when the simulation needs to be viewed in context.
- The standalone simulation is safe by default and provides explicit **NORMAL**, **FIRE TEST**, and **CLEAR** controls.

## Deployment Strategy & Scalability (Nainital Example)

Our deployment model scales cost-effectively from a single prototype to full district-wide coverage:

1. **Prototype (Bhowali Range):** 1 Gateway + 1 Node (~₹20,000) covering 5-10 km².
2. **Small Cluster:** 1 Gateway + 15 Nodes (~₹65K - 1.15L) covering 50-100 km².
3. **Priority Zones:** 8 Gateways + 80-160 Nodes (~₹5.2L - 9.2L) targeting 8 major fire-prone ranges (Naina, Kosi, etc.).
4. **Selective District Coverage:** 30-50 Gateways + 300-1000 Nodes (~₹19.5L - 57.5L) covering 10-30% of the district's 2,866 km² forest area.

## Architecture

The visual IA follows the PRD's specified dashboard pages and core features:
Live Map, Incident Center, Incident Detail, Sensors & Air Quality, Device Health, Alerts, Analytics, Admin, Public Alert View, and the Deployment Strategy page.

The map is an offline-friendly visual prototype; it can later be swapped for Leaflet + cached OSM/MBTiles, while keeping the same UI shell.

## Backend integration points

The dashboard uses the FastAPI service when it is running and retains simulated fallback data for presentation. Replace or extend the API functions in `frontend/js/api.js` with:
- FastAPI REST calls
- FastAPI WebSocket/SSE for real-time events
- SQLite/PostgreSQL for telemetry and incidents
- MQTT/LoRa gateway data
- YOLOv8 / CNN-LSTM inference outputs
- Local image evidence from the gateway
- Alert gateways (SMS/push/siren/CAP feed)
