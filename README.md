# GEN ERA — SIH26178 Early-Warning Dashboard Demo

A self-contained, presentation-ready browser prototype derived from the supplied GEN ERA PRD.

## What is included

- Live Map control-room dashboard
- Simulated environmental sensor telemetry
- Fire/smoke and gas-leak incident simulation
- Multi-modal confidence / severity display
- Incident Center with search
- Sensors & Air page
- Device Health page for 16 nodes
- Alert Composer + delivery log
- Analytics & Reports view
- Admin / thresholds page
- Public Alert View
- Dark / light mode
- English / Hindi toggle
- Online / Offline state simulation via browser network events
- Local demo persistence-ready structure (easy to connect to a backend later)
- No external CDN or framework dependency in this demo, so the prototype opens offline.

## Run

1. Extract the ZIP.
2. Open `index.html` directly in Chrome/Edge, or use VS Code Live Server.
3. For the SIH demo, click **Simulate Fire Event** or **Simulate Gas Leak**.
4. Open the Incident Center to show the evidence-first response workflow.
5. Toggle **Heat**, **Nodes**, **Incidents**, and **Zones** on the map.
6. Use **हि** for Hindi UI and **◐** for light/dark mode.

## PRD mapping

The visual IA follows the PRD's specified dashboard pages and core features:
Live Map, Incident Center, Incident Detail, Sensors & Air Quality, Device Health, Alerts, Analytics, Admin and Public Alert View.

The dashboard intentionally labels demo coordinates/imagery as simulated. The map is an offline-friendly visual prototype; it can later be swapped for Leaflet + cached OSM/MBTiles, while keeping the same UI shell.

## Backend integration points

The current UI is static/simulated. Replace the `state` data and simulation functions in `app.js` with:
- FastAPI REST calls
- FastAPI WebSocket/SSE for real-time events
- SQLite/PostgreSQL for telemetry and incidents
- MQTT/LoRa gateway data
- YOLOv8 / CNN-LSTM inference outputs
- Local image evidence from the gateway
- Alert gateways (SMS/push/siren/CAP feed)

Do not present synthetic values as field-validated measurements.
