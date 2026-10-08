"""
data.py — Single source of truth for all ZenAlert simulated data.
Every number on both the landing page and the dashboard derives from this module.
"""

import random
import time
import math
from datetime import datetime, timedelta
from copy import deepcopy

# ── Thresholds ────────────────────────────────────────────────
THRESHOLDS = {
    "pm25": {"normal": 60, "watch": 100, "high": 150, "critical": 250},
    "mq2":  {"normal": 200, "watch": 400, "high": 600, "critical": 800},
    "mq135":{"normal": 150, "watch": 300, "high": 450, "critical": 600},
    "temp": {"normal": 35, "watch": 38, "high": 42, "critical": 48},
    "humidity_low": {"watch": 25, "critical": 15},
    "vision_confidence": {"critical": 0.85, "high": 0.70, "watch": 0.50},
}

SEVERITY_ORDER = ["normal", "watch", "high", "critical"]

def severity_from_value(value, metric):
    """Return severity string based on thresholds."""
    t = THRESHOLDS.get(metric, {})
    if not t:
        return "normal"
    for sev in reversed(SEVERITY_ORDER):
        if sev in t and value >= t[sev]:
            return sev
    return "normal"

SEVERITY_COLORS = {
    "normal":   "#22c55e",
    "watch":    "#eab308",
    "high":     "#f97316",
    "critical": "#ef4444",
    "offline":  "#6b7280",
}

# ── Pilot region ──────────────────────────────────────────────
PILOT = {
    "name": "Bhowali Range",
    "district": "Nainital",
    "state": "Uttarakhand",
    "center": [29.3947, 79.5059],
    "zoom": 13,
}

# ── Gateway ───────────────────────────────────────────────────
GATEWAY = {
    "id": "EDGE-GW-01",
    "type": "NVIDIA Jetson Orin Nano",
    "lat": 29.3920,
    "lon": 79.5100,
    "uptime_pct": 99.2,
    "cpu_load": 42,
    "ram_pct": 61,
    "storage_pct": 38,
    "battery_pct": 81,
    "rssi_dbm": -71,
    "packet_loss_pct": 1.4,
    "firmware": "2.1.4",
    "models": ["YOLOv8n-fire", "CNN-LSTM-fusion"],
    "status": "online",
}

def _noise(base, amplitude=3):
    return round(base + random.uniform(-amplitude, amplitude), 1)

def gateway_snapshot():
    """Return gateway health with gentle noise."""
    g = deepcopy(GATEWAY)
    g["cpu_load"] = max(5, min(95, round(g["cpu_load"] + random.uniform(-6, 6))))
    g["ram_pct"] = max(20, min(90, round(g["ram_pct"] + random.uniform(-4, 4))))
    g["storage_pct"] = max(10, min(80, round(g["storage_pct"] + random.uniform(-1, 1))))
    g["battery_pct"] = max(10, min(100, round(g["battery_pct"] + random.uniform(-2, 0.5))))
    g["rssi_dbm"] = round(g["rssi_dbm"] + random.uniform(-3, 3))
    g["packet_loss_pct"] = round(max(0, g["packet_loss_pct"] + random.uniform(-0.3, 0.3)), 1)
    return g


# ── Sensor Nodes ──────────────────────────────────────────────
_BASE_NODES = [
    {"id": "N-BHW-001", "lat": 29.4015, "lon": 79.4925, "zone": "Nainital Edge",      "sensors": ["MQ2","MQ135","GP2Y","DHT11","CAM"]},
    {"id": "N-BHW-002", "lat": 29.4078, "lon": 79.4980, "zone": "Nainital Ridge",      "sensors": ["MQ2","MQ135","GP2Y","DHT11"]},
    {"id": "N-BHW-003", "lat": 29.4030, "lon": 79.5020, "zone": "Upper Bhowali",       "sensors": ["MQ2","MQ135","GP2Y","DHT11","CAM"]},
    {"id": "N-BHW-004", "lat": 29.4180, "lon": 79.4760, "zone": "Roadside Cluster",    "sensors": ["MQ2","MQ135","GP2Y","DHT11"]},
    {"id": "N-BHW-005", "lat": 29.4005, "lon": 79.5055, "zone": "Central Bhowali",     "sensors": ["MQ2","MQ135","GP2Y","DHT11","CAM"]},
    {"id": "N-BHW-006", "lat": 29.3985, "lon": 79.5110, "zone": "Bhowali South",       "sensors": ["MQ2","MQ135","GP2Y","DHT11"]},
    {"id": "N-BHW-007", "lat": 29.3947, "lon": 79.5059, "zone": "Bhowali Forest Edge", "sensors": ["MQ2","MQ135","GP2Y","DHT11","CAM"]},
    {"id": "N-BHW-008", "lat": 29.3890, "lon": 79.5130, "zone": "Bhowali East",        "sensors": ["MQ2","MQ135","GP2Y","DHT11","CAM"]},
    {"id": "N-BHW-009", "lat": 29.3835, "lon": 79.5175, "zone": "Kathgodam Link",      "sensors": ["MQ2","MQ135","GP2Y","DHT11"]},
    {"id": "N-BHW-010", "lat": 29.3780, "lon": 79.5090, "zone": "Kathgodam Edge",      "sensors": ["MQ2","MQ135","GP2Y","DHT11"]},
    {"id": "N-BHW-011", "lat": 29.3550, "lon": 79.5230, "zone": "Sattal Corridor",     "sensors": ["MQ2","MQ135","GP2Y","DHT11","CAM"]},
    {"id": "N-BHW-012", "lat": 29.3700, "lon": 79.4990, "zone": "Sattal North",        "sensors": ["MQ2","MQ135","GP2Y","DHT11"]},
    {"id": "N-BHW-013", "lat": 29.3650, "lon": 79.4870, "zone": "Jageshwar Link",      "sensors": ["MQ2","MQ135","GP2Y","DHT11"]},
    {"id": "N-BHW-014", "lat": 29.3820, "lon": 79.4830, "zone": "Jageshwar South",     "sensors": ["MQ2","MQ135","GP2Y","DHT11","CAM"]},
    {"id": "N-BHW-015", "lat": 29.3750, "lon": 79.4750, "zone": "West Ridge",          "sensors": ["MQ2","MQ135","GP2Y","DHT11"]},
    {"id": "N-BHW-016", "lat": 29.3600, "lon": 79.5300, "zone": "Eastern Perimeter",   "sensors": ["MQ2","MQ135","GP2Y","DHT11"]},
]

def _make_telemetry(node_id, incident_node=False):
    """Generate realistic telemetry for a node."""
    if incident_node:
        return {
            "pm25": round(120 + random.uniform(0, 40), 1),
            "mq2": round(580 + random.uniform(0, 80)),
            "mq135": round(380 + random.uniform(0, 60)),
            "temp": round(39 + random.uniform(0, 4), 1),
            "humidity": round(15 + random.uniform(0, 8), 1),
        }
    return {
        "pm25": round(30 + random.uniform(0, 35), 1),
        "mq2": round(80 + random.uniform(0, 120)),
        "mq135": round(80 + random.uniform(0, 100)),
        "temp": round(24 + random.uniform(0, 8), 1),
        "humidity": round(45 + random.uniform(0, 25), 1),
    }


# ── Live state ────────────────────────────────────────────────
class SimState:
    """Mutable singleton holding the current simulated world."""

    def __init__(self):
        self._next_incident_id = 2042
        self._boot = time.time()
        self.incidents = [
            {
                "id": 2041,
                "severity": "critical",
                "type": "Forest Fire / Smoke",
                "node": "N-BHW-007",
                "zone": "Bhowali Forest Edge",
                "lat": 29.3947,
                "lon": 79.5059,
                "confidence": 0.91,
                "vision_score": 0.94,
                "sensor_score": 0.87,
                "context_score": 0.71,
                "time": "12:14:07",
                "timestamp": datetime.now().isoformat(),
                "status": "OPEN",
                "timeline": [
                    {"t": "12:14:05", "event": "Sensor threshold crossed — MQ2 612, PM2.5 138 µg/m³"},
                    {"t": "12:14:06", "event": "Camera triggered — 3 verification frames captured"},
                    {"t": "12:14:06", "event": "YOLOv8 + CNN-LSTM fusion → confidence 0.91 → CRITICAL"},
                    {"t": "12:14:07", "event": "Dashboard alert + siren + SMS published"},
                ],
            },
            {
                "id": 2040,
                "severity": "high",
                "type": "PM2.5 Spike",
                "node": "N-BHW-011",
                "zone": "Sattal Corridor",
                "lat": 29.355,
                "lon": 79.523,
                "confidence": 0.78,
                "vision_score": 0.72,
                "sensor_score": 0.82,
                "context_score": 0.65,
                "time": "12:11:28",
                "timestamp": datetime.now().isoformat(),
                "status": "OPEN",
                "timeline": [
                    {"t": "12:11:26", "event": "PM2.5 proxy exceeded 150 µg/m³ threshold"},
                    {"t": "12:11:27", "event": "MQ135 air quality index elevated — 410"},
                    {"t": "12:11:28", "event": "Fusion score 0.78 → HIGH severity classified"},
                ],
            },
            {
                "id": 2039,
                "severity": "watch",
                "type": "Gas / Air Quality",
                "node": "N-BHW-004",
                "zone": "Roadside Cluster",
                "lat": 29.418,
                "lon": 79.476,
                "confidence": 0.54,
                "vision_score": 0.42,
                "sensor_score": 0.61,
                "context_score": 0.48,
                "time": "12:06:41",
                "timestamp": datetime.now().isoformat(),
                "status": "OPEN",
                "timeline": [
                    {"t": "12:06:39", "event": "MQ2 gas index crossed watch threshold — 420"},
                    {"t": "12:06:40", "event": "Context: near road, daytime — reduced risk weighting"},
                    {"t": "12:06:41", "event": "Fusion score 0.54 → WATCH level — monitoring"},
                ],
            },
        ]

        # Node statuses — derived from incidents
        self._incident_nodes = {i["node"] for i in self.incidents if i["status"] == "OPEN"}
        self._offline_nodes = {"N-BHW-015", "N-BHW-016"}

        self.delivery_log = [
            {"time": "12:14:07", "incident": "INC-2041", "channel": "Siren",  "group": "Bhowali responders", "status": "DELIVERED"},
            {"time": "12:14:07", "incident": "INC-2041", "channel": "SMS",    "group": "District admin",     "status": "DELIVERED"},
            {"time": "12:14:08", "incident": "INC-2041", "channel": "Push",   "group": "Forest Dept.",       "status": "DELIVERED"},
            {"time": "12:11:29", "incident": "INC-2040", "channel": "Push",   "group": "Bhowali responders", "status": "DELIVERED"},
            {"time": "12:11:30", "incident": "INC-2040", "channel": "SMS",    "group": "District admin",     "status": "DELIVERED"},
            {"time": "12:06:42", "incident": "INC-2039", "channel": "Push",   "group": "Forest Dept.",       "status": "DELIVERED"},
        ]

        # SSE subscribers
        self.sse_queues = []

    def _incident_severity_for_node(self, node_id):
        for inc in self.incidents:
            if inc["node"] == node_id and inc["status"] == "OPEN":
                return inc["severity"]
        return None

    def nodes_snapshot(self):
        """Return all nodes with derived status and noisy telemetry."""
        nodes = []
        for base in _BASE_NODES:
            nid = base["id"]
            is_offline = nid in self._offline_nodes
            inc_sev = self._incident_severity_for_node(nid)
            is_incident_node = inc_sev is not None

            if is_offline:
                status = "offline"
            elif inc_sev:
                status = inc_sev
            else:
                status = "normal"

            telemetry = _make_telemetry(nid, is_incident_node) if not is_offline else None

            battery = round(random.uniform(20, 95)) if not is_offline else 0
            rssi = round(-60 + random.uniform(-18, 5)) if not is_offline else -100
            packet_loss = round(random.uniform(0.2, 3.5), 1) if not is_offline else 100.0
            firmware = "1.2.3" if nid not in ("N-BHW-015",) else "1.1.9"

            last_seen = "Just now" if not is_offline else "2h 14m ago"

            nodes.append({
                **base,
                "status": status,
                "severity_color": SEVERITY_COLORS.get(status, SEVERITY_COLORS["normal"]),
                "telemetry": telemetry,
                "battery_pct": battery,
                "rssi_dbm": rssi,
                "packet_loss_pct": packet_loss,
                "firmware": firmware,
                "last_seen": last_seen,
            })
        return nodes

    def node_telemetry_history(self, node_id, points=30):
        """Return simulated time-series for a node."""
        inc_sev = self._incident_severity_for_node(node_id)
        base_pm = 130 if inc_sev else 45
        base_mq2 = 600 if inc_sev else 120
        series = []
        now = datetime.now()
        for i in range(points):
            t = now - timedelta(minutes=points - i)
            drift = math.sin(i * 0.3) * 12
            series.append({
                "time": t.strftime("%H:%M"),
                "pm25": round(base_pm + drift + random.uniform(-5, 5), 1),
                "mq2": round(base_mq2 + drift * 3 + random.uniform(-10, 10)),
                "mq135": round((base_mq2 * 0.65) + drift * 2 + random.uniform(-8, 8)),
                "temp": round(28 + drift * 0.3 + random.uniform(-1, 1), 1),
                "humidity": round(40 - drift * 0.2 + random.uniform(-2, 2), 1),
            })
        return series

    def overview(self):
        """Stats for KPI cards and landing page."""
        nodes = self.nodes_snapshot()
        online_count = sum(1 for n in nodes if n["status"] != "offline")
        total_count = len(nodes)
        open_incidents = [i for i in self.incidents if i["status"] == "OPEN"]
        critical_count = sum(1 for i in open_incidents if i["severity"] == "critical")
        high_count = sum(1 for i in open_incidents if i["severity"] == "high")
        watch_count = sum(1 for i in open_incidents if i["severity"] == "watch")

        pm_values = [n["telemetry"]["pm25"] for n in nodes if n["telemetry"]]
        avg_pm = round(sum(pm_values) / len(pm_values), 1) if pm_values else 0

        gw = gateway_snapshot()
        return {
            "nodes_online": online_count,
            "nodes_total": total_count,
            "open_incidents": len(open_incidents),
            "critical_count": critical_count,
            "high_count": high_count,
            "watch_count": watch_count,
            "avg_pm25": avg_pm,
            "alert_latency_s": round(1.1 + random.uniform(0, 0.5), 1),
            "packet_delivery_pct": round(98.1 + random.uniform(0, 1.3), 1),
            "gateway_uptime_pct": gw["uptime_pct"],
            "gateway": gw,
        }

    def analytics(self):
        """Return analytics data for charts."""
        # 7-day trend
        trend_7d = []
        for i in range(24):
            trend_7d.append(round(40 + i * 4.2 + random.uniform(-8, 8)))
        # 30-day trend
        trend_30d = []
        for i in range(30):
            trend_30d.append(round(30 + i * 2.5 + random.uniform(-6, 6)))

        return {
            "alerts_7d": 38,
            "alerts_7d_change": -11,
            "avg_response_min": 4.2,
            "false_alarm_rate_pct": 2.1,
            "node_uptime_pct": 99.2,
            "trend_7d": trend_7d,
            "trend_30d": trend_30d,
            "incident_mix": {
                "fire_smoke": 42,
                "pm25_spike": 31,
                "gas_aq": 19,
                "other": 8,
            },
            "response_trend": [4.8, 4.5, 4.2, 3.9, 4.1, 3.8, 4.2],
            "false_alarm_trend": [3.2, 2.8, 2.5, 2.1, 2.4, 2.0, 2.1],
            "node_uptime_heatmap": self._uptime_heatmap(),
        }

    def _uptime_heatmap(self):
        """Generate node-uptime heatmap data (node x 7 days)."""
        hm = {}
        for base in _BASE_NODES:
            nid = base["id"]
            row = []
            for d in range(7):
                if nid in self._offline_nodes and d >= 5:
                    row.append(round(random.uniform(0, 40)))
                else:
                    row.append(round(random.uniform(92, 100), 1))
            hm[nid] = row
        return hm

    def create_incident(self, inc_type, severity, node_id, zone, confidence):
        """Create a new incident and return it."""
        iid = self._next_incident_id
        self._next_incident_id += 1
        now = datetime.now()
        tstr = now.strftime("%H:%M:%S")

        inc = {
            "id": iid,
            "severity": severity,
            "type": inc_type,
            "node": node_id,
            "zone": zone,
            "lat": next((n["lat"] for n in _BASE_NODES if n["id"] == node_id), 29.39),
            "lon": next((n["lon"] for n in _BASE_NODES if n["id"] == node_id), 79.50),
            "confidence": round(confidence, 2),
            "vision_score": round(confidence * random.uniform(0.95, 1.05), 2),
            "sensor_score": round(confidence * random.uniform(0.85, 1.0), 2),
            "context_score": round(confidence * random.uniform(0.7, 0.9), 2),
            "time": tstr,
            "timestamp": now.isoformat(),
            "status": "OPEN",
            "timeline": [
                {"t": (now - timedelta(seconds=2)).strftime("%H:%M:%S"), "event": f"Sensor threshold crossed on {node_id}"},
                {"t": (now - timedelta(seconds=1)).strftime("%H:%M:%S"), "event": "Camera triggered — verification frames captured"},
                {"t": tstr, "event": f"AI fusion → confidence {confidence:.2f} → {severity.upper()}"},
                {"t": tstr, "event": "Dashboard + alert channels published"},
            ],
        }
        self.incidents.insert(0, inc)
        self._incident_nodes.add(node_id)

        # Broadcast to SSE
        self._broadcast_sse({"type": "incident", "data": inc})

        return inc

    def update_incident(self, inc_id, action):
        """Acknowledge, dispatch, or mark false alarm."""
        for inc in self.incidents:
            if inc["id"] == inc_id:
                now = datetime.now().strftime("%H:%M:%S")
                if action == "acknowledge":
                    inc["status"] = "ACKNOWLEDGED"
                    inc["timeline"].append({"t": now, "event": "Acknowledged by officer"})
                elif action == "dispatch":
                    inc["status"] = "DISPATCHED"
                    inc["timeline"].append({"t": now, "event": "Response team dispatched"})
                elif action == "false-alarm":
                    inc["status"] = "FALSE_ALARM"
                    inc["timeline"].append({"t": now, "event": "Marked as false alarm — added to feedback queue"})
                    if inc["node"] in self._incident_nodes:
                        # Only remove if no other open incidents on this node
                        other = any(i["node"] == inc["node"] and i["status"] == "OPEN" and i["id"] != inc_id for i in self.incidents)
                        if not other:
                            self._incident_nodes.discard(inc["node"])
                self._broadcast_sse({"type": "incident_update", "data": {"id": inc_id, "status": inc["status"]}})
                return inc
        return None

    def add_delivery_log(self, entry):
        self.delivery_log.insert(0, entry)
        return entry

    def _broadcast_sse(self, payload):
        import json
        for q in self.sse_queues:
            try:
                q.put_nowait(json.dumps(payload))
            except Exception:
                pass

    def telemetry_tick(self):
        """Generate a live telemetry SSE event."""
        # Pick a random online node
        online = [n for n in _BASE_NODES if n["id"] not in self._offline_nodes]
        if not online:
            return
        node = random.choice(online)
        is_inc = node["id"] in self._incident_nodes
        telem = _make_telemetry(node["id"], is_inc)
        payload = {
            "type": "telemetry",
            "data": {
                "node_id": node["id"],
                **telem,
                "time": datetime.now().strftime("%H:%M:%S"),
            }
        }
        self._broadcast_sse(payload)


# Singleton
sim = SimState()
