/**
 * api.js — API client with fallback to embedded mock data
 *
 * Configuration:
 *   Production (Vercel):  Set window.ZENALERT_API_BASE in a <script> tag
 *                         before this module loads, OR edit the PRODUCTION_API_URL
 *                         constant below after creating your Render service.
 *   Local development:    Automatically uses http://127.0.0.1:8000 when served
 *                         from dev-server ports, or the same origin when served
 *                         by the FastAPI backend directly.
 */

// ── API Base URL Resolution ─────────────────────────────────────
//
// Priority order:
// 1. window.ZENALERT_API_BASE  — set by inline <script> in HTML (recommended for Vercel)
// 2. PRODUCTION_API_URL        — hardcoded fallback for production
// 3. Local dev fallback        — auto-detected from port number
// 4. Same-origin fallback      — when served by the FastAPI backend
//
// IMPORTANT: After creating your Render service, replace the empty string
// below with your Render URL, e.g. 'https://zenalert-api.onrender.com'
// This acts as the fallback when window.ZENALERT_API_BASE is not set.
const PRODUCTION_API_URL = '';

function resolveApiBase() {
  // 1. Explicit override via global variable (set in HTML or by Vercel config)
  if (window.ZENALERT_API_BASE) {
    return window.ZENALERT_API_BASE.replace(/\/+$/, '');
  }

  // 2. Detect local development environments
  const port = window.location.port;
  const hostname = window.location.hostname;
  const isLocalDev = hostname === 'localhost' || hostname === '127.0.0.1';
  const devPorts = ['5500', '5501', '3000', '8765', '8770'];

  if (isLocalDev && devPorts.includes(port)) {
    return 'http://127.0.0.1:8000';
  }

  // 3. If we're on the same origin as FastAPI (local dev via port 8000)
  if (isLocalDev && port === '8000') {
    return window.location.origin;
  }

  // 4. Production: use the configured Render URL
  if (PRODUCTION_API_URL) {
    return PRODUCTION_API_URL;
  }

  // 5. Fallback: assume same-origin (works when FastAPI serves frontend)
  return window.location.origin;
}

const API_BASE = resolveApiBase();
let _online = true;
let _eventSource = null;
const _listeners = new Map(); // event type → Set<callback>

// Expose the resolved API base for debugging
console.info(`[ZenAlert] API base: ${API_BASE}`);

/**
 * Generic fetch wrapper with fallback.
 */
async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _online = true;
    return await res.json();
  } catch (err) {
    _online = false;
    console.warn(`[api] ${path} failed, using fallback:`, err.message);
    return null;
  }
}

/* ── Endpoints ──────────────────────────────────────────────── */
export async function fetchOverview() {
  return (await apiFetch('/api/overview')) || FALLBACK.overview;
}

export async function fetchIncidents() {
  return (await apiFetch('/api/incidents')) || FALLBACK.incidents;
}

export async function fetchIncident(id) {
  return (await apiFetch(`/api/incidents/${id}`)) || FALLBACK.incidents.find(i => i.id === id);
}

export async function fetchNodes() {
  return (await apiFetch('/api/nodes')) || FALLBACK.nodes;
}

export async function fetchNodeTelemetry(nodeId) {
  return (await apiFetch(`/api/nodes/${nodeId}/telemetry`)) || FALLBACK.telemetry;
}

export async function fetchAnalytics() {
  return (await apiFetch('/api/analytics')) || FALLBACK.analytics;
}

export async function fetchGateway() {
  return (await apiFetch('/api/gateway')) || FALLBACK.gateway;
}

export async function fetchDeliveryLog() {
  return (await apiFetch('/api/delivery-log')) || FALLBACK.deliveryLog;
}

export async function acknowledgeIncident(id) {
  return apiFetch(`/api/incidents/${id}/acknowledge`, { method: 'POST' });
}

export async function dispatchIncident(id) {
  return apiFetch(`/api/incidents/${id}/dispatch`, { method: 'POST' });
}

export async function falseAlarmIncident(id) {
  return apiFetch(`/api/incidents/${id}/false-alarm`, { method: 'POST' });
}

export async function broadcastAlert(payload) {
  return apiFetch('/api/alerts/broadcast', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function simulateFire() {
  const res = await apiFetch('/api/simulate/fire', { method: 'POST' });
  if (!res) {
    const incident = {
      id: Date.now(), severity: 'critical', type: 'Forest Fire / Smoke',
      node: 'N-SIM-001', zone: 'Test Fire Zone', lat: 29.3947, lng: 79.4582,
      ai_confidence: 0.99, timestamp: new Date().toISOString()
    };
    if(FALLBACK.incidents) FALLBACK.incidents.unshift(incident);
    return { ok: true, incident };
  }
  return res;
}

export async function simulateGas() {
  const res = await apiFetch('/api/simulate/gas', { method: 'POST' });
  if (!res) {
    const incident = {
      id: Date.now() + 1, severity: 'warn', type: 'Toxic Gas Detection',
      node: 'N-SIM-002', zone: 'Test Industrial Zone', lat: 29.3940, lng: 79.4590,
      ai_confidence: 0, timestamp: new Date().toISOString()
    };
    if(FALLBACK.incidents) FALLBACK.incidents.unshift(incident);
    return { ok: true, incident };
  }
  return res;
}

/* ── SSE Stream ─────────────────────────────────────────────── */
export function connectStream() {
  if (_eventSource) return;
  try {
    _eventSource = new EventSource(`${API_BASE}/api/stream`);
    _eventSource.onmessage = (evt) => {
      try {
        const payload = JSON.parse(evt.data);
        const cbs = _listeners.get(payload.type);
        if (cbs) cbs.forEach(cb => cb(payload.data));
      } catch (e) {
        console.warn('[sse] parse error', e);
      }
    };
    _eventSource.onerror = () => {
      _eventSource.close();
      _eventSource = null;
      // Retry in 5s
      setTimeout(connectStream, 5000);
    };
  } catch (e) {
    console.warn('[sse] connection failed', e);
  }
}

export function onStreamEvent(type, callback) {
  if (!_listeners.has(type)) _listeners.set(type, new Set());
  _listeners.get(type).add(callback);
}

export function isOnline() { return _online; }

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
    _online = res.ok;
    return _online;
  } catch {
    _online = false;
    return false;
  }
}

/* ── Fallback data ──────────────────────────────────────────── */
const FALLBACK = {
  overview: {
    nodes_online: 14,
    nodes_total: 16,
    open_incidents: 3,
    critical_count: 1,
    high_count: 1,
    watch_count: 1,
    avg_pm25: 64,
    alert_latency_s: 1.3,
    packet_delivery_pct: 98.6,
    gateway_uptime_pct: 99.2,
    gateway: {
      id: 'EDGE-GW-01',
      type: 'NVIDIA Jetson Orin Nano',
      cpu_load: 42,
      ram_pct: 61,
      storage_pct: 38,
      battery_pct: 81,
      rssi_dbm: -71,
      packet_loss_pct: 1.4,
      uptime_pct: 99.2,
      status: 'online',
    },
  },
  incidents: [
    {
      id: 2041, severity: 'critical', type: 'Forest Fire / Smoke', node: 'N-BHW-007',
      zone: 'Bhowali Forest Edge', lat: 29.3947, lon: 79.5059, confidence: 0.91,
      vision_score: 0.94, sensor_score: 0.87, context_score: 0.71,
      time: '12:14:07', timestamp: new Date().toISOString(), status: 'OPEN',
      timeline: [
        { t: '12:14:05', event: 'Sensor threshold crossed — MQ2 612, PM2.5 138 µg/m³' },
        { t: '12:14:06', event: 'Camera triggered — 3 verification frames captured' },
        { t: '12:14:06', event: 'YOLOv8 + CNN-LSTM fusion → confidence 0.91 → CRITICAL' },
        { t: '12:14:07', event: 'Dashboard alert + siren + SMS published' },
      ],
    },
    {
      id: 2040, severity: 'high', type: 'PM2.5 Spike', node: 'N-BHW-011',
      zone: 'Sattal Corridor', lat: 29.355, lon: 79.523, confidence: 0.78,
      vision_score: 0.72, sensor_score: 0.82, context_score: 0.65,
      time: '12:11:28', timestamp: new Date().toISOString(), status: 'OPEN',
      timeline: [
        { t: '12:11:26', event: 'PM2.5 proxy exceeded 150 µg/m³ threshold' },
        { t: '12:11:27', event: 'MQ135 air quality index elevated — 410' },
        { t: '12:11:28', event: 'Fusion score 0.78 → HIGH severity classified' },
      ],
    },
    {
      id: 2039, severity: 'watch', type: 'Gas / Air Quality', node: 'N-BHW-004',
      zone: 'Roadside Cluster', lat: 29.418, lon: 79.476, confidence: 0.54,
      vision_score: 0.42, sensor_score: 0.61, context_score: 0.48,
      time: '12:06:41', timestamp: new Date().toISOString(), status: 'OPEN',
      timeline: [
        { t: '12:06:39', event: 'MQ2 gas index crossed watch threshold — 420' },
        { t: '12:06:40', event: 'Context: near road, daytime — reduced risk weighting' },
        { t: '12:06:41', event: 'Fusion score 0.54 → WATCH level — monitoring' },
      ],
    },
  ],
  nodes: [],
  telemetry: [],
  analytics: {
    alerts_7d: 38, alerts_7d_change: -11, avg_response_min: 4.2,
    false_alarm_rate_pct: 2.1, node_uptime_pct: 99.2,
    trend_7d: [42,48,51,45,56,64,58,67,74,71,82,96,89,102,98,110,118,112,126,121,133,129,140,138],
    trend_30d: [31,34,38,36,40,44,42,48,51,46,54,57,59,55,62,66,64,71,74,70,78,82,80,86,89,94,90,98,101,105],
    incident_mix: { fire_smoke: 42, pm25_spike: 31, gas_aq: 19, other: 8 },
    response_trend: [4.8, 4.5, 4.2, 3.9, 4.1, 3.8, 4.2],
    false_alarm_trend: [3.2, 2.8, 2.5, 2.1, 2.4, 2.0, 2.1],
    node_uptime_heatmap: {},
  },
  gateway: {
    id: 'EDGE-GW-01', type: 'NVIDIA Jetson Orin Nano',
    cpu_load: 42, ram_pct: 61, storage_pct: 38, battery_pct: 81,
    rssi_dbm: -71, packet_loss_pct: 1.4, uptime_pct: 99.2, status: 'online',
  },
  deliveryLog: [
    { time: '12:14:07', incident: 'INC-2041', channel: 'Siren',  group: 'Bhowali responders', status: 'DELIVERED' },
    { time: '12:14:07', incident: 'INC-2041', channel: 'SMS',    group: 'District admin',     status: 'DELIVERED' },
    { time: '12:11:29', incident: 'INC-2040', channel: 'Push',   group: 'Forest Dept.',       status: 'DELIVERED' },
  ],
};
