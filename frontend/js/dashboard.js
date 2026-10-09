/**
 * dashboard.js — Main app logic for the ZenAlert dashboard.
 */

import { initRouter, registerRoute, navigate } from './router.js';
import * as api from './api.js?v=3';
import { initMap, updateNodes, flyTo, toggleLayer } from './map.js';
import * as charts from './charts.js';
import { SensorNode3D } from './3d-model.js';

let appState = {
  theme: localStorage.getItem('zenalert-theme') || 'dark',
  lang: localStorage.getItem('zenalert-dashboard-lang') || 'en',
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
    sidebar.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => sidebar.classList.remove('open'));
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

  // Translation Dictionary
  const i18n = {
    en: {
      nav_overview: "Overview", nav_map: "Live Threat Map", nav_network: "Sensor Network", 
      nav_sensors: "Sensor Intelligence", nav_ai: "AI Verification", nav_incidents: "Incidents", 
      nav_alerts: "Alerts", nav_analytics: "Analytics", nav_deployment: "Deployment", 
      nav_prototype: "Prototype", nav_system: "System", nav_admin: "Admin",
      overview_title: "Operations Overview", overview_desc: "Real-time command center for early-warning threat detection.",
      deployment_title: "Deployment Strategy", deployment_desc: "Deployment Example: Nainital (Uttarakhand) - Scalability & Cost Analysis",
      system_title: "System Health & Risks", system_desc: "Visual matrix of operational integrity, hardware health, and automated mitigations.",
      prototype_title: "Sensor Node Prototype", prototype_desc: "Interactive 3D model and live fire-event simulation engine.",
      nav_network_title: "Network Architecture", nav_network_desc: "System topology and offline-first state monitoring.",
      map_title: "Environmental operations at a glance.", map_desc: "See verified signals, active incidents and network health in one shared operational view.",
      btn_fire: "Simulate Fire Event", btn_gas: "Simulate Gas Leak",
      kpi_nodes: "Nodes Online", kpi_incidents: "Open Incidents", kpi_threat: "Global Threat Level", kpi_activity: "Live Activity Feed",
      table_id: "ID", table_type: "TYPE", table_zone: "ZONE", table_ai: "AI CONF", table_status: "STATUS",
      status_online: "System Status", status_text: "Online",
      offline_mode: "OFFLINE MODE · Attempting reconnection...",
      ops_label: "Operations / Environmental Monitoring"
      , admin_title: "Administration", admin_desc: "Maintain access, operating thresholds and readiness.",
      admin_users: "Users & Roles", admin_thresholds: "Thresholds", admin_user: "User", admin_role: "Role",
      admin_zone: "Zone", admin_2fa: "2FA", admin_confidence: "Critical Confidence Threshold",
      admin_timeout: "Node Offline Timeout (mins)", admin_save: "Save Configuration",
      system_compute: "Jetson Compute Load", system_peak: "Peak Inference",
      system_mitigation: "Auto-Mitigation Active", system_mitigation_desc: "Event-triggered AI ensures YOLOv8 only runs when sensor thresholds (>150 AQI) are crossed, saving 80% idle compute.",
      system_packet: "LoRa Packet Loss", system_canopy: "Canopy Interference", system_buffer: "Buffer Engaged",
      system_buffer_desc: "Node-level SRAM buffering stores up to 48 hours of critical events until an ACK is received from the Jetson gateway.",
      system_calibration: "Sensor Calibration",
      system_topology_title: "Infrastructure Topology Health", topology_solar: "Solar Arrays", status_optimal: "Optimal",
      topology_charge: "Average Charge Capacity", topology_generation: "Generation", topology_draw: "Draw",
      topology_uplink: "Mesh Uplink", status_active: "Active", topology_latency: "Average Gateway Latency",
      topology_signal: "Signal Strength", topology_type: "Topology", topology_vision: "Vision Models",
      status_updating: "Updating", topology_weights: "Current YOLOv8 Weights", topology_accuracy: "Accuracy",
      topology_next_sync: "Next Sync", topology_two_hours: "In 2 hrs", topology_api: "API Endpoints",
      status_online_value: "Online", topology_uptime: "Gateway Uptime (30d)", topology_requests: "Requests",
      topology_errors: "Errors"
      , network_mesh_title: "Live Mesh Topology", network_offline_active: "Offline-First Mode Active",
      network_offline_desc: "The network is currently operating autonomously. Critical threat verification is happening locally on the NVIDIA Jetson edge gateway. Alerts will be broadcasted via localized sirens until connection is restored.",
      network_power_title: "Power System Visualization (Edge Gateway)", power_solar: "SOLAR PANEL",
      power_controller: "CHARGE CONTROLLER", power_mppt: "MPPT Active", power_battery: "BATTERY",
      power_electronics: "ELECTRONICS", system_baseline: "Baseline Drift", system_offset: "Dynamic Offset",
      system_offset_desc: "Continuous baseline drift tracking automatically adjusts the zero-point for MQ135/MQ2 daily to prevent false positives."
    },
    hi: {
      nav_overview: "अवलोकन (Overview)", nav_map: "लाइव खतरा मानचित्र", nav_network: "सेंसर नेटवर्क", 
      nav_sensors: "सेंसर इंटेलिजेंस", nav_ai: "एआई सत्यापन", nav_incidents: "घटनाएँ", 
      nav_alerts: "अलर्ट (Alerts)", nav_analytics: "एनालिटिक्स", nav_deployment: "तैनाती", 
      nav_prototype: "प्रोटोटाइप", nav_system: "सिस्टम", nav_admin: "एडमिन",
      overview_title: "संचालन अवलोकन", overview_desc: "प्रारंभिक चेतावनी खतरे का पता लगाने के लिए वास्तविक समय कमान केंद्र।",
      deployment_title: "तैनाती रणनीति", deployment_desc: "तैनाती उदाहरण: नैनीताल - स्केलेबिलिटी और लागत विश्लेषण।",
      system_title: "सिस्टम स्वास्थ्य और जोखिम", system_desc: "हार्डवेयर स्वास्थ्य और स्वचालित शमन का दृश्य मैट्रिक्स।",
      prototype_title: "सेंसर नोड प्रोटोटाइप", prototype_desc: "इंटरएक्टिव 3डी मॉडल और लाइव फायर-इवेंट सिमुलेशन इंजन।",
      nav_network_title: "नेटवर्क आर्किटेक्चर", nav_network_desc: "सिस्टम टोपोलॉजी और ऑफलाइन-फर्स्ट स्टेट मॉनिटरिंग।",
      map_title: "एक नज़र में पर्यावरण संचालन।", map_desc: "एक साझा परिचालन दृश्य में सत्यापित संकेत, सक्रिय घटनाएं और नेटवर्क स्वास्थ्य देखें।",
      btn_fire: "अग्नि घटना अनुकरण करें", btn_gas: "गैस रिसाव अनुकरण करें",
      kpi_nodes: "ऑनलाइन नोड्स", kpi_incidents: "खुली घटनाएं", kpi_threat: "वैश्विक खतरा स्तर", kpi_activity: "लाइव गतिविधि फ़ीड",
      table_id: "आईडी", table_type: "प्रकार", table_zone: "क्षेत्र", table_ai: "एआई पुष्टि", table_status: "स्थिति",
      status_online: "सिस्टम स्थिति", status_text: "ऑनलाइन",
      offline_mode: "ऑफ़लाइन मोड · पुनः कनेक्शन का प्रयास...",
      ops_label: "संचालन / पर्यावरणीय निगरानी"
      , admin_title: "प्रशासन", admin_desc: "पहुंच, संचालन सीमाओं और तैयारी का प्रबंधन करें।",
      admin_users: "उपयोगकर्ता और भूमिकाएं", admin_thresholds: "सीमाएं", admin_user: "उपयोगकर्ता", admin_role: "भूमिका",
      admin_zone: "क्षेत्र", admin_2fa: "2FA", admin_confidence: "गंभीरता कॉन्फिडेंस सीमा",
      admin_timeout: "नोड ऑफ़लाइन समय सीमा (मिनट)", admin_save: "कॉन्फ़िगरेशन सहेजें",
      system_compute: "Jetson कंप्यूट लोड", system_peak: "पीक इन्फरेंस",
      system_mitigation: "स्वचालित शमन सक्रिय", system_mitigation_desc: "इवेंट-ट्रिगर AI केवल सेंसर सीमा (>150 AQI) पार होने पर YOLOv8 चलाता है, जिससे 80% निष्क्रिय कंप्यूट बचता है।",
      system_packet: "LoRa पैकेट लॉस", system_canopy: "पेड़ों से हस्तक्षेप", system_buffer: "बफर सक्रिय",
      system_buffer_desc: "नोड-स्तरीय SRAM बफर Jetson गेटवे से ACK मिलने तक 48 घंटे की महत्वपूर्ण घटनाएं रखता है।",
      system_calibration: "सेंसर कैलिब्रेशन",
      system_topology_title: "इंफ्रास्ट्रक्चर टोपोलॉजी स्वास्थ्य", topology_solar: "सौर ऐरे", status_optimal: "उत्कृष्ट",
      topology_charge: "औसत चार्ज क्षमता", topology_generation: "उत्पादन", topology_draw: "खपत",
      topology_uplink: "मेष अपलिंक", status_active: "सक्रिय", topology_latency: "औसत गेटवे विलंबता",
      topology_signal: "सिग्नल शक्ति", topology_type: "टोपोलॉजी", topology_vision: "विज़न मॉडल",
      status_updating: "अपडेट हो रहा है", topology_weights: "वर्तमान YOLOv8 वेट्स", topology_accuracy: "सटीकता",
      topology_next_sync: "अगला सिंक", topology_two_hours: "2 घंटे में", topology_api: "API एंडपॉइंट",
      status_online_value: "ऑनलाइन", topology_uptime: "गेटवे अपटाइम (30 दिन)", topology_requests: "रिक्वेस्ट",
      topology_errors: "त्रुटियां"
      , network_mesh_title: "लाइव मेष टोपोलॉजी", network_offline_active: "ऑफलाइन-फर्स्ट मोड सक्रिय",
      network_offline_desc: "नेटवर्क अभी स्वायत्त रूप से चल रहा है। गंभीर खतरे का सत्यापन NVIDIA Jetson एज गेटवे पर स्थानीय रूप से हो रहा है। कनेक्शन बहाल होने तक अलर्ट स्थानीय सायरन से प्रसारित होंगे।",
      network_power_title: "पावर सिस्टम विज़ुअलाइज़ेशन (एज गेटवे)", power_solar: "सौर पैनल",
      power_controller: "चार्ज कंट्रोलर", power_mppt: "MPPT सक्रिय", power_battery: "बैटरी",
      power_electronics: "इलेक्ट्रॉनिक्स", system_baseline: "बेसलाइन ड्रिफ्ट", system_offset: "डायनेमिक ऑफसेट",
      system_offset_desc: "बेसलाइन ड्रिफ्ट की लगातार निगरानी MQ135/MQ2 के ज़ीरो-पॉइंट को रोज़ाना समायोजित करती है ताकि गलत अलर्ट रोके जा सकें।"
    }
  };

  function updateLanguage() {
    const dict = i18n[appState.lang] || i18n.en;
    document.documentElement.lang = appState.lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });
    const activeHeading = document.querySelector('.page.active .subpage-header h2');
    const pageTitle = document.getElementById('pageTitle');
    if (activeHeading && pageTitle) pageTitle.textContent = activeHeading.textContent.trim();
  }

  // Language toggle
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      appState.lang = appState.lang === 'en' ? 'hi' : 'en';
      localStorage.setItem('zenalert-dashboard-lang', appState.lang);
      langToggle.innerHTML = appState.lang === 'en'
        ? '<span class="lang-active">EN</span><span aria-hidden="true"> | </span><span>हिं</span>'
        : '<span>EN</span><span aria-hidden="true"> | </span><span class="lang-active">हिं</span>';
      langToggle.setAttribute('aria-pressed', String(appState.lang === 'hi'));
      updateLanguage();
      updateShell();
      showToast('Language Changed', `Interface language set to ${appState.lang === 'en' ? 'English' : 'हिंदी'}.`, 'info');
    });
    langToggle.innerHTML = appState.lang === 'en'
      ? '<span class="lang-active">EN</span><span aria-hidden="true"> | </span><span>हिं</span>'
      : '<span>EN</span><span aria-hidden="true"> | </span><span class="lang-active">हिं</span>';
    langToggle.setAttribute('aria-pressed', String(appState.lang === 'hi'));
  }
  updateLanguage();

  // Live/Demo Toggle
  const btnLive = document.getElementById('btnModeLive');
  const btnDemo = document.getElementById('btnModeDemo');
  if (btnLive && btnDemo) {
    btnLive.addEventListener('click', () => {
      btnLive.className = "flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full bg-critical/20 text-critical border border-critical shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all tracking-widest uppercase";
      btnLive.innerHTML = '<div class="w-1.5 h-1.5 rounded-full bg-critical animate-pulse"></div> LIVE';
      btnDemo.className = "px-3 py-1 text-[10px] font-bold rounded-full text-secondary hover:text-primary transition-all tracking-widest uppercase border border-transparent";
      btnDemo.innerHTML = 'DEMO';
      showToast('Live Mode', 'Connected to production mesh network.', 'warning');
    });
    btnDemo.addEventListener('click', () => {
      btnDemo.className = "flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full bg-accent/20 text-accent border border-accent shadow-[0_0_10px_rgba(94,234,198,0.3)] transition-all tracking-widest uppercase";
      btnDemo.innerHTML = '<div class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div> DEMO';
      btnLive.className = "px-3 py-1 text-[10px] font-bold rounded-full text-secondary hover:text-primary transition-all tracking-widest uppercase border border-transparent";
      btnLive.innerHTML = 'LIVE';
      showToast('Demo Mode', 'Simulation data is now active.', 'info');
    });
  }
  


  // Simulate incident buttons removed

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
window.showToast = showToast;

async function refreshData() {
  try {
    const [overview, incidents, nodes] = await Promise.all([
      api.fetchOverview(),
      api.fetchIncidents(),
      api.fetchNodes()
    ]);
    await api.checkHealth();
    
    appState.overview = overview;
    appState.incidents = incidents;
    appState.nodes = nodes;
    
    updateShell();
    
    // Refresh active route data
    const activePage = document.querySelector('.page.active');
    if (activePage) {
      const id = activePage.id.replace('page-', '');
      if (id === 'overview') renderOverviewPage();
      else if (id === 'map') renderMapPage();
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
  if (connText) {
    connText.textContent = isOnline
      ? (appState.lang === 'hi' ? 'ऑनलाइन' : 'Online')
      : (appState.lang === 'hi' ? 'ऑफ़लाइन' : 'Offline');
  }
  
  if (banner) {
    banner.hidden = isOnline;
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
  registerRoute('overview', { title: 'Command Center Overview', onEnter: () => renderOverviewPage() });
  registerRoute('map', { title: 'Live Environmental Map', onEnter: () => renderMapPage() });
  registerRoute('incidents', { title: 'Incident Center', onEnter: () => renderIncidentsPage() });
  registerRoute('sensors', { title: 'Sensors & Air Quality', onEnter: () => renderSensorsPage() });
  registerRoute('devices', { title: 'Device Health', onEnter: () => renderDevicesPage() });
  registerRoute('alerts', { title: 'Alert Operations' });
  registerRoute('analytics', { title: 'Analytics & Reports', onEnter: () => renderAnalyticsPage() });
  registerRoute('deployment', { title: 'Deployment Strategy' });
  registerRoute('prototype', { title: 'Sensor Node Prototype', onEnter: () => renderPrototypePage() });
  registerRoute('system', { title: 'System Health & Risks' });
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

function renderOverviewPage() {
  const data = appState.overview;
  if (!data) return;
  
  const feed = document.getElementById('overviewFeed');
  if (feed && appState.incidents) {
    feed.innerHTML = appState.incidents.slice(0, 5).map(inc => `
      <div class="incident-feed-item" onclick="window.location.hash='incidents'; setTimeout(() => window.openIncidentDetail(${inc.id}), 100);">
        <div class="incident-feed-dot ${inc.severity === 'critical' ? 'bg-critical' : (inc.severity === 'high' ? 'bg-high' : 'bg-watch')}" style="background-color: var(--severity-${inc.severity})"></div>
        <div class="incident-feed-content">
          <div class="incident-feed-type">${inc.type}</div>
          <div class="incident-feed-meta">${inc.zone} · ${inc.node}</div>
        </div>
        <div class="incident-feed-time">${inc.time}</div>
      </div>
    `).join('') || '<div class="p-3 text-sm text-muted">No active incidents</div>';
  }
}

let prototype3D = null;
function renderPrototypePage() {
  if (!prototype3D) {
    setTimeout(() => {
      const container = document.getElementById('dashboard3DContainer');
      if (container && container.clientWidth > 0) {
        prototype3D = new SensorNode3D('dashboard3DContainer', {
          autoRotate: true,
          onClick: (name) => {
            const drawer = document.getElementById('info3DDrawer');
            if (drawer) {
              drawer.style.display = 'block';
              document.getElementById('info3DTitle').textContent = name;
              document.getElementById('info3DDesc').textContent = 'Live telemetry and hardware diagnostics for ' + name;
            }
          }
        });
        
        document.getElementById('btn3dExplode')?.addEventListener('click', () => {
          if(prototype3D) prototype3D.toggleExploded();
        });
        document.getElementById('btn3dReset')?.addEventListener('click', () => {
          if(prototype3D) {
            prototype3D.isExploded = false;
            prototype3D.highlightComponent(null);
            document.getElementById('info3DDrawer').style.display = 'none';
          }
        });
      }
    }, 100);
  }
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
