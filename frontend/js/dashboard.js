/**
 * dashboard.js — Main app logic for the ZenAlert dashboard.
 */

import { initRouter, registerRoute, navigate } from './router.js';
import * as api from './api.js';
import { initMap, updateNodes, flyTo, toggleLayer } from './map.js';
import * as charts from './charts.js';

let appState = {
  theme: localStorage.getItem('zenalert-theme') || 'dark',
  lang: 'en',
  incidents: [],
  nodes: [],
  overview: null,
};

document.addEventListener('DOMContentLoaded', async () => {
  // Theme initialization
  applyTheme(appState.theme);
  
  // Lucide icons
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Sidebar toggle
  const mobileMenuBtn = document.getElementById('mobileMenu');
  const sidebar = document.getElementById('sidebar');
  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
      applyTheme(appState.theme);
      showToast('Theme Updated', `Switched to ${appState.theme} mode.`, 'info');
      
      // Re-render charts for new theme colors
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    });
  }

  // Language toggle stub
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      appState.lang = appState.lang === 'en' ? 'hi' : 'en';
      langToggle.textContent = appState.lang === 'en' ? 'हिं' : 'EN';
      showToast('Language Changed', `Interface language set to ${appState.lang.toUpperCase()}.`, 'info');
    });
  }
  
  // Simulation buttons
  const btnFire = document.getElementById('simulateFire');
  const btnGas = document.getElementById('simulateGas');
  if (btnFire) btnFire.addEventListener('click', async () => {
    try {
      const res = await api.simulateFire();
      if (res && res.incident) {
        showToast('Simulation', 'Fire event simulated.', 'critical');
        await refreshData();
      }
    } catch(e) { console.error(e); }
  });
  
  if (btnGas) btnGas.addEventListener('click', async () => {
    try {
      const res = await api.simulateGas();
      if (res && res.incident) {
        showToast('Simulation', 'Gas leak simulated.', 'warn');
        await refreshData();
      }
    } catch(e) { console.error(e); }
  });

  // Init Router & Pages
  initPages();
  initRouter('map');
  
  // Connect SSE
  api.onStreamEvent('incident', (data) => {
    showToast('New Incident', `${data.type} detected at ${data.zone}`, data.severity === 'critical' ? 'critical' : 'warn');
    refreshData();
  });
  api.onStreamEvent('incident_update', (data) => {
    refreshData();
  });
  api.connectStream();

  // Initial load
  await refreshData();
  
  // Setup periodic refresh
  setInterval(refreshData, 5000);
});

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('zenalert-theme', theme);
}

function showToast(title, message, type = 'info') {
  const stack = document.getElementById('toastStack');
  if (!stack) return;
  
  const el = document.createElement('div');
  el.className = 'toast';
  
  const icons = {
    info: '<i data-lucide="info" class="toast-icon info"></i>',
    warn: '<i data-lucide="alert-triangle" class="toast-icon warn"></i>',
    critical: '<i data-lucide="alert-octagon" class="toast-icon critical"></i>'
  };
  
  el.innerHTML = `
    ${icons[type] || icons.info}
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;
  
  stack.appendChild(el);
  if (typeof lucide !== 'undefined') lucide.createIcons({ root: el });
  
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px) scale(0.95)';
    setTimeout(() => el.remove(), 300);
  }, 4000);
}

async function refreshData() {
  try {
    const [overview, incidents, nodes] = await Promise.all([
      api.fetchOverview(),
      api.fetchIncidents(),
      api.fetchNodes()
    ]);
    
    appState.overview = overview;
    appState.incidents = incidents;
    appState.nodes = nodes;
    
    updateShell();
    
    // Refresh active route data
    const activePage = document.querySelector('.page.active');
    if (activePage) {
      const id = activePage.id.replace('page-', '');
      if (id === 'map') renderMapPage();
      else if (id === 'incidents') renderIncidentsPage();
      else if (id === 'sensors') renderSensorsPage();
      else if (id === 'devices') renderDevicesPage();
      else if (id === 'analytics') renderAnalyticsPage();
      // admin, alerts, public don't necessarily need periodic data updates in the same way
    }
    
  } catch (err) {
    console.error('Refresh failed', err);
  }
}

function updateShell() {
  const data = appState.overview;
  if (!data) return;
  
  // Connection status
  const isOnline = api.isOnline();
  const connStatus = document.getElementById('connectionStatus');
  const connText = document.getElementById('connectionText');
  const banner = document.getElementById('offlineBanner');
  
  if (connStatus) connStatus.className = `status-dot ${isOnline ? 'green' : 'gray'}`;
  if (connText) connText.textContent = isOnline ? 'Online' : 'Offline';
  
  if (banner) {
    if (isOnline) banner.classList.remove('show');
    else banner.classList.add('show');
  }

  // Badges
  const openCount = data.open_incidents || 0;
  document.querySelectorAll('.nav-count').forEach(el => {
    el.textContent = openCount;
    el.style.display = openCount > 0 ? 'flex' : 'none';
  });
  const topBadge = document.getElementById('globalAlertCount');
  if (topBadge) {
    topBadge.textContent = openCount;
    topBadge.style.display = openCount > 0 ? 'flex' : 'none';
  }
}

// ── Page Initializers & Renderers ─────────────────────────────

function initPages() {
  registerRoute('map', { title: 'Live Environmental Map', onEnter: () => renderMapPage() });
  registerRoute('incidents', { title: 'Incident Center', onEnter: () => renderIncidentsPage() });
  registerRoute('sensors', { title: 'Sensors & Air Quality', onEnter: () => renderSensorsPage() });
  registerRoute('devices', { title: 'Device Health', onEnter: () => renderDevicesPage() });
  registerRoute('alerts', { title: 'Alert Operations' });
  registerRoute('analytics', { title: 'Analytics & Reports', onEnter: () => renderAnalyticsPage() });
  registerRoute('admin', { title: 'Administration' });
  registerRoute('ai-verify', { title: 'AI Verification' });
  registerRoute('network', { title: 'Network Architecture' });
  registerRoute('public', { title: 'Public Alert View', onEnter: () => window.location.href = 'public-alert.html' });
  
  // Map page layer toggles
  document.querySelectorAll('.chip[data-layer]').forEach(chip => {
    chip.addEventListener('click', (e) => {
      chip.classList.toggle('active');
      const layer = chip.dataset.layer;
      toggleLayer(layer, chip.classList.contains('active'));
    });
  });

  // Setup modal close handlers
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', closeIncidentModal);
  });
}

function renderMapPage() {
  const data = appState.overview;
  if (!data) return;

  // KPIs
  document.getElementById('kpiNodes').textContent = data.nodes_online;
  document.getElementById('kpiNodesTotal').textContent = '/' + data.nodes_total;
  
  const incEl = document.getElementById('kpiIncidents');
  incEl.textContent = data.open_incidents;
  incEl.className = `kpi-value ${data.open_incidents > 0 ? 'text-critical' : ''}`;
  
  document.getElementById('kpiPm25').textContent = data.avg_pm25;
  document.getElementById('kpiLatency').textContent = data.alert_latency_s.toFixed(1);

  // Init map if not already done
  initMap('mapView');
  updateNodes(appState.nodes);

  // Render incident feed
  const feed = document.getElementById('incidentFeed');
  if (feed && appState.incidents) {
    feed.innerHTML = appState.incidents.slice(0, 5).map(inc => `
      <div class="incident-feed-item" onclick="window.openIncidentDetail(${inc.id})">
        <div class="incident-feed-dot ${inc.severity === 'critical' ? 'bg-critical' : (inc.severity === 'high' ? 'bg-high' : 'bg-watch')}" style="background-color: var(--severity-${inc.severity})"></div>
        <div class="incident-feed-content">
          <div class="incident-feed-type">${inc.type}</div>
          <div class="incident-feed-meta">${inc.zone} · ${inc.node}</div>
        </div>
        <div class="incident-feed-time">${inc.time}</div>
      </div>
    `).join('') || '<div class="p-3 text-sm text-muted">No active incidents</div>';
  }
  
  // Render dummy sparkline for the selected node (using random generated data for demo)
  if (document.getElementById('sensorChart')) {
     const dummyData = Array.from({length: 30}, (_,i) => 40 + Math.sin(i*0.2)*10 + Math.random()*5);
     charts.createLineChart('sensorChart', dummyData, { label: 'PM2.5', showXAxis: false });
  }
}

function renderIncidentsPage() {
  const table = document.getElementById('incidentTableBody');
  if (!table) return;
  
  if (appState.incidents.length === 0) {
    table.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: var(--sp-8);">No incidents found.</td></tr>`;
    return;
  }
  
  table.innerHTML = appState.incidents.map(inc => `
    <tr>
      <td><span class="severity-chip ${inc.severity}">${inc.severity}</span></td>
      <td><strong>${inc.type}</strong></td>
      <td><span class="mono">${inc.node}</span></td>
      <td>${inc.zone}</td>
      <td>${inc.confidence.toFixed(2)}</td>
      <td><span class="status-badge ${inc.status.toLowerCase()}">${inc.status}</span></td>
      <td>
        <button class="btn-text" onclick="window.openIncidentDetail(${inc.id})">Review ↗</button>
      </td>
    </tr>
  `).join('');
}

function renderSensorsPage() {
  // Demo static setup for sensors page charts
  if (!document.getElementById('sensorChart1')) return;
  
  setTimeout(() => {
    const d1 = Array.from({length: 24}, (_,i) => 80 + Math.random()*20 + (i>18?40:0));
    charts.createLineChart('sensorChart1', d1, { 
      thresholds: [{ value: 150, label: 'High', color: '#F97316' }] 
    });
    
    const d2 = Array.from({length: 24}, (_,i) => 200 + Math.random()*50);
    charts.createLineChart('sensorChart2', d2, {
      thresholds: [{ value: 400, label: 'Watch', color: '#EAB308' }]
    });
  }, 100);
}

function renderDevicesPage() {
  const table = document.getElementById('devicesTableBody');
  if (!table) return;
  
  table.innerHTML = appState.nodes.map(node => `
    <tr>
      <td><span class="mono">${node.id}</span></td>
      <td><span class="status-badge ${node.status === 'offline' ? 'offline' : (node.status==='normal'?'delivered':'open')}">${node.status.toUpperCase()}</span></td>
      <td>
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="progress-bar" style="width: 40px;"><div class="fill" style="width: ${node.battery_pct}%; background: ${node.battery_pct<20?'var(--severity-critical)':'var(--severity-normal)'}"></div></div>
          <span>${node.battery_pct}%</span>
        </div>
      </td>
      <td>${node.rssi_dbm} dBm</td>
      <td>${node.packet_loss_pct}%</td>
      <td><span class="mono">${node.firmware}</span></td>
      <td>${node.last_seen}</td>
    </tr>
  `).join('');
}

function renderAnalyticsPage() {
  const data = appState.overview;
  // Initialize analytics charts
  setTimeout(async () => {
    try {
      const analytics = await api.fetchAnalytics();
      if (!analytics) return;
      
      charts.createLineChart('analyticsTrendChart', analytics.trend_7d, { label: 'Anomaly Score' });
      
      charts.createDoughnutChart('analyticsMixChart', 
        ['Fire / Smoke', 'PM2.5 Spike', 'Gas / AQ', 'Other'],
        [analytics.incident_mix.fire_smoke, analytics.incident_mix.pm25_spike, analytics.incident_mix.gas_aq, analytics.incident_mix.other],
        ['#EF4444', '#F97316', '#EAB308', '#6B7280']
      );
      
      charts.createBarChart('analyticsResponseChart', 
        ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], 
        analytics.response_trend, 
        { label: 'Response Time (m)', color: 'rgba(94, 234, 198, 0.6)' }
      );
      
      // Heatmap generation
      const heatmap = document.getElementById('uptimeHeatmap');
      if (heatmap) {
        heatmap.innerHTML = appState.nodes.slice(0, 8).map(node => {
          const cells = Array.from({length: 14}, () => {
            const up = Math.random() > 0.05;
            const color = up ? 'var(--severity-normal)' : (Math.random() > 0.5 ? 'var(--severity-critical)' : 'var(--severity-watch)');
            return `<div class="heatmap-cell" style="background: ${color}; opacity: ${0.7 + Math.random()*0.3}"></div>`;
          }).join('');
          return `<div class="heatmap-row"><div class="heatmap-label">${node.id}</div>${cells}</div>`;
        }).join('');
      }
      
      // 7d/30d toggle logic
      document.getElementById('btn7d')?.addEventListener('click', (e) => {
        e.target.classList.add('bg-hover', 'text-primary', 'font-medium');
        e.target.classList.remove('text-secondary', 'hover:text-primary');
        const b30 = document.getElementById('btn30d');
        if(b30) {
          b30.classList.remove('bg-hover', 'text-primary', 'font-medium');
          b30.classList.add('text-secondary', 'hover:text-primary');
        }
      });
      document.getElementById('btn30d')?.addEventListener('click', (e) => {
        e.target.classList.add('bg-hover', 'text-primary', 'font-medium');
        e.target.classList.remove('text-secondary', 'hover:text-primary');
        const b7 = document.getElementById('btn7d');
        if(b7) {
          b7.classList.remove('bg-hover', 'text-primary', 'font-medium');
          b7.classList.add('text-secondary', 'hover:text-primary');
        }
      });
    } catch(e) { console.error(e); }
  }, 100);
}

// ── Incident Modal Logic ──────────────────────────────────────

window.openIncidentDetail = async (id) => {
  try {
    const inc = await api.fetchIncident(id);
    if (!inc) return;
    
    document.getElementById('modalTitle').textContent = `${inc.severity.toUpperCase()} · ${inc.type}`;
    document.getElementById('modalNode').textContent = inc.node;
    document.getElementById('modalZone').textContent = inc.zone;
    document.getElementById('modalConf').textContent = inc.confidence.toFixed(2);
    document.getElementById('modalTime').textContent = inc.time;
    
    // Action buttons state
    const actions = document.getElementById('modalActions');
    if (actions) {
      if (inc.status === 'OPEN') {
        actions.innerHTML = `
          <button class="btn btn-primary" onclick="window.handleIncidentAction(${id}, 'acknowledge')">
            <i data-lucide="check-circle"></i> Acknowledge
          </button>
          <button class="btn btn-warn" onclick="window.handleIncidentAction(${id}, 'dispatch')">
            <i data-lucide="truck"></i> Dispatch
          </button>
          <button class="btn btn-ghost" onclick="window.handleIncidentAction(${id}, 'false-alarm')">
            Mark false alarm
          </button>
        `;
      } else {
        actions.innerHTML = `<div class="text-sm text-muted">Status: <span class="status-badge ${inc.status.toLowerCase()}">${inc.status}</span></div>`;
      }
      if (typeof lucide !== 'undefined') lucide.createIcons({ root: actions });
    }

    // Timeline
    const tl = document.getElementById('modalTimeline');
    if (tl) {
      tl.innerHTML = inc.timeline.map(item => `
        <div class="timeline-item">
          <div class="timeline-time">${item.t}</div>
          <div class="timeline-event">${item.event}</div>
        </div>
      `).join('');
    }
    
    const overlay = document.getElementById('incidentModal');
    const drawer = document.getElementById('incidentDrawer');
    if (overlay && drawer) {
      overlay.classList.add('open');
      drawer.classList.add('open');
    }
  } catch(e) { console.error(e); }
};

window.handleIncidentAction = async (id, action) => {
  try {
    let res;
    if (action === 'acknowledge') res = await api.acknowledgeIncident(id);
    if (action === 'dispatch') res = await api.dispatchIncident(id);
    if (action === 'false-alarm') res = await api.falseAlarmIncident(id);
    
    if (res && res.ok) {
      showToast('Incident Updated', `Successfully performed ${action}.`, 'info');
      closeIncidentModal();
      refreshData();
    }
  } catch (e) {
    showToast('Error', 'Failed to update incident.', 'critical');
  }
};

function closeIncidentModal() {
  const overlay = document.getElementById('incidentModal');
  const drawer = document.getElementById('incidentDrawer');
  if (overlay) overlay.classList.remove('open');
  if (drawer) drawer.classList.remove('open');
}
