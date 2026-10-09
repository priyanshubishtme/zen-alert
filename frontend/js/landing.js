/**
 * landing.js — Logic specific to the landing page.
 */

import { fetchOverview } from './api.js?v=2';
import { initLandingAnimations } from './animations.js';

// Landing page translations
const landingI18n = {
  en: {
    hero_badge: 'SIH 2026 · Problem Statement 26178',
    hero_title_1: 'Resilient Environmental',
    hero_title_2: 'Early-Warning',
    hero_title_3: ' System',
    hero_desc: 'Multi-sensor IoT nodes with edge AI inference detect forest fires, gas leaks, and air quality hazards — alerting responders in under 2 seconds, even offline.',
    hero_cta: 'Open Live Dashboard',
    hero_cta2: 'View Architecture',
    lbl_nodes: 'ACTIVE NODES:',
    lbl_edge: 'EDGE AI:',
    lbl_latency: 'LATENCY:',
    nav_hw: 'Hardware',
    nav_arch: 'Architecture',
    nav_haz: 'Hazards',
    nav_dash: 'Open dashboard',
    system_arch_eyebrow: 'System Architecture',
    system_arch_title: 'Offline-First Operational Intelligence',
    system_arch_desc: 'ZenAlert operates independently of cloud connectivity. Local intelligence guarantees that even during total grid failure, field teams receive life-saving alerts.',
    flow_sensors_desc: 'Continuous field telemetry',
    flow_esp32_desc: 'Sensor aggregation',
    flow_jetson_desc: 'Vision AI & Routing',
    flow_gis_desc: 'Live mapping backend',
    flow_alert_desc: 'Siren / SMS Broadcast',
    arch_eyebrow: 'SIH26178 Technical Approach',
    arch_title: 'How ZenAlert Works',
    arch_desc: 'From physical sensor readings to verified incident alerts — a four-stage pipeline with zero cloud dependency.',
    step1_title: 'Multi-Sensor Data Ingestion',
    step2_title: 'Edge Inference & Multi-Modal Verification',
    step3_title: 'Long-Range Off-Grid Transmission',
    step4_title: 'Alert Generation & Mapping',
    haz_eyebrow: 'Threat Intelligence',
    haz_title: 'Multi-Threat Environmental Awareness',
    haz_fire: 'Forest Fire',
    haz_gas: 'Gas Leakage',
    haz_air: 'Air Pollution',
    feat_offline: 'Offline-First Operation',
    feat_solar: 'Solar Power Management',
    feat_offline_desc: 'In the event of a telecom blackout, the local LoRa mesh and edge AI continue analyzing threats and triggering localized sirens.',
    feat_solar_desc: 'Solar panels and MPPT charge controllers ensure continuous operation, dynamically scaling power draw based on risk levels.',
    prototype_explorer: 'Prototype Explorer',
    comp_esp32: 'ESP32-S3 Controller',
    comp_camera: 'IMX219 Camera Module',
    comp_mq135: 'MQ135 Gas Sensor',
    comp_mq2: 'MQ2 Smoke Sensor',
    comp_pm25: 'GP2Y1010 PM2.5',
    comp_lora: 'SX1278 LoRa Module',
    comp_solar: 'Solar Power System',
    telemetry: 'Live Node Telemetry',
    step1_desc: 'ESP32-S3 nodes collect continuous analog and digital streams from environmental sensors. Data is buffered locally, filtered for noise, and packaged into lightweight payloads for efficient transmission.',
    step1_b1: 'Dynamic sampling rates based on battery SOC.',
    step1_b2: 'Local calibration offsets applied.',
    step1_b3: 'Image capture is triggered only upon sensor anomaly.',
    step2_desc: 'NVIDIA Jetson Nano acts as the local gateway. YOLOv8 detects fire and smoke while a CNN-LSTM model forecasts sensor trends. The results are fused into a single confidence score.',
    step2_b1: 'Zero cloud dependency for inference.',
    step2_b2: 'Multi-modal fusion prevents false positives.',
    step3_desc: 'Using LoRa modules, sensor nodes transmit data over a multi-kilometer radius to the edge gateway without cellular or Wi-Fi infrastructure. A self-healing mesh keeps packets moving when nodes go offline.',
    step4_desc: 'Verified incidents are pushed through FastAPI to the MapLibre dashboard. Authorities see real-time threat mapping and can dispatch SMS, push, and local siren alerts.',
    hazards_eyebrow: 'Threat Intelligence',
    hazards_title: 'Multi-Threat Environmental Awareness',
    hazard_fire_desc: 'Early detection of localized combustion and smoke plumes before uncontrolled spread, using thermal proxies and visual AI.',
    hazard_gas_desc: 'Continuous monitoring for combustible gases such as LPG, methane, and smoke in roadside or infrastructure corridors.',
    hazard_air_desc: 'Tracking particulate matter and air-quality indices to identify harmful environmental shifts.',
    cta_title: 'Command the network.',
    cta_desc: 'Access the live operational dashboard to view telemetry, manage the GIS threat map, and dispatch alerts.',
    cta_button: 'Launch Dashboard Interface',
    technical_cta: 'View Complete Technical Architecture →',
    footer_project: 'Project',
    footer_team: 'GEN ERA Team',
    footer_location: 'Bhowali, Nainital',
    footer_license: 'MIT LICENSE',
    footer_context: 'Context',
    footer_sih: 'SIH 2026 · Problem Statement 26178',
    footer_tagline: 'Offline-first environmental early warning.',
    footer_tagline_long: 'Resilient Environmental AI. Building localized, offline-first early warning systems for the communities most at risk from ecological disasters.',
    footer_copyright: '© 2026 ZenAlert. All rights reserved.',
    footer_built: 'Built for local response teams.',
    footer_location_short: 'Bhowali · Nainital',
  },
  hi: {
    hero_badge: 'SIH 2026 · समस्या विवरण 26178',
    hero_title_1: 'प्रतिरोधी पर्यावरणीय',
    hero_title_2: 'पूर्व-चेतावनी',
    hero_title_3: ' प्रणाली',
    hero_desc: 'एज AI इन्फ़रेंस वाले मल्टी-सेंसर IoT नोड्स वन अग्नि, गैस रिसाव और वायु गुणवत्ता खतरों का पता लगाते हैं — 2 सेकंड से कम में, ऑफ़लाइन भी।',
    hero_cta: 'लाइव डैशबोर्ड खोलें',
    hero_cta2: 'आर्किटेक्चर देखें',
    lbl_nodes: 'सक्रिय नोड्स:',
    lbl_edge: 'एज AI:',
    lbl_latency: 'विलंबता:',
    nav_hw: 'हार्डवेयर',
    nav_arch: 'आर्किटेक्चर',
    nav_haz: 'खतरे',
    nav_dash: 'डैशबोर्ड खोलें',
    system_arch_eyebrow: 'सिस्टम आर्किटेक्चर',
    system_arch_title: 'ऑफ़लाइन-फर्स्ट ऑपरेशनल इंटेलिजेंस',
    system_arch_desc: 'ZenAlert क्लाउड कनेक्टिविटी के बिना काम करता है। स्थानीय इंटेलिजेंस पूरी ग्रिड विफलता के दौरान भी फील्ड टीमों तक जीवनरक्षक अलर्ट पहुंचाती है।',
    flow_sensors_desc: 'लगातार फील्ड टेलीमेट्री',
    flow_esp32_desc: 'सेंसर डेटा एकत्रीकरण',
    flow_jetson_desc: 'विज़न AI और रूटिंग',
    flow_gis_desc: 'लाइव मैपिंग बैकएंड',
    flow_alert_desc: 'सायरन / SMS प्रसारण',
    arch_eyebrow: 'SIH26178 तकनीकी दृष्टिकोण',
    arch_title: 'ZenAlert कैसे काम करता है',
    arch_desc: 'भौतिक सेंसर रीडिंग से सत्यापित घटना अलर्ट तक — शून्य क्लाउड निर्भरता के साथ चार-चरण पाइपलाइन।',
    step1_title: 'मल्टी-सेंसर डेटा इंजेशन',
    step2_title: 'एज इन्फ़रेंस और मल्टी-मोडल सत्यापन',
    step3_title: 'लॉन्ग-रेंज ऑफ-ग्रिड ट्रांसमिशन',
    step4_title: 'अलर्ट जनरेशन और मैपिंग',
    haz_eyebrow: 'खतरा बुद्धिमत्ता',
    haz_title: 'बहु-खतरा पर्यावरणीय जागरूकता',
    haz_fire: 'वन अग्नि',
    haz_gas: 'गैस रिसाव',
    haz_air: 'वायु प्रदूषण',
    feat_offline: 'ऑफ़लाइन-फर्स्ट ऑपरेशन',
    feat_solar: 'सौर ऊर्जा प्रबंधन',
    feat_offline_desc: 'दूरसंचार बंद होने पर भी स्थानीय LoRa मेष और एज AI खतरों का विश्लेषण करके स्थानीय सायरन सक्रिय करते हैं।',
    feat_solar_desc: 'सौर पैनल और MPPT चार्ज नियंत्रक लगातार संचालन सुनिश्चित करते हैं और जोखिम के अनुसार बिजली उपयोग को समायोजित करते हैं।',
    prototype_explorer: 'प्रोटोटाइप एक्सप्लोरर',
    comp_esp32: 'ESP32-S3 कंट्रोलर',
    comp_camera: 'IMX219 कैमरा मॉड्यूल',
    comp_mq135: 'MQ135 गैस सेंसर',
    comp_mq2: 'MQ2 धुआं सेंसर',
    comp_pm25: 'GP2Y1010 PM2.5',
    comp_lora: 'SX1278 LoRa मॉड्यूल',
    comp_solar: 'सौर ऊर्जा प्रणाली',
    telemetry: 'लाइव नोड टेलीमेट्री',
    step1_desc: 'ESP32-S3 नोड पर्यावरणीय सेंसर से लगातार एनालॉग और डिजिटल डेटा लेते हैं। डेटा स्थानीय रूप से बफर, शोर से फ़िल्टर और कुशल ट्रांसमिशन के लिए पैकेज किया जाता है।',
    step1_b1: 'बैटरी स्तर के अनुसार सैंपलिंग दर।',
    step1_b2: 'स्थानीय कैलिब्रेशन ऑफसेट लागू।',
    step1_b3: 'सेंसर असामान्यता पर ही इमेज कैप्चर।',
    step2_desc: 'NVIDIA Jetson Nano स्थानीय गेटवे की तरह काम करता है। YOLOv8 आग और धुएं का पता लगाता है, जबकि CNN-LSTM सेंसर ट्रेंड का अनुमान लगाता है। परिणाम एक संयुक्त कॉन्फिडेंस स्कोर में मिलते हैं।',
    step2_b1: 'इन्फरेंस के लिए क्लाउड पर निर्भरता नहीं।',
    step2_b2: 'मल्टी-मोडल फ्यूजन गलत अलर्ट रोकता है।',
    step3_desc: 'LoRa मॉड्यूल के जरिए सेंसर नोड बिना सेलुलर या Wi-Fi के कई किलोमीटर तक डेटा भेजते हैं। सेल्फ-हीलिंग मेष ऑफलाइन नोड के बावजूद पैकेट पहुंचाता है।',
    step4_desc: 'सत्यापित घटनाएं FastAPI के जरिए MapLibre डैशबोर्ड पर भेजी जाती हैं। अधिकारी रियल-टाइम खतरा मैपिंग देख सकते हैं और SMS, पुश व स्थानीय सायरन अलर्ट भेज सकते हैं।',
    hazards_eyebrow: 'खतरा बुद्धिमत्ता',
    hazards_title: 'बहु-खतरा पर्यावरणीय जागरूकता',
    hazard_fire_desc: 'अनियंत्रित फैलाव से पहले स्थानीय दहन और धुएं का पता लगाने के लिए थर्मल प्रॉक्सी और विजुअल AI का उपयोग।',
    hazard_gas_desc: 'सड़क या बुनियादी ढांचा क्षेत्रों में LPG, मीथेन और धुएं जैसी ज्वलनशील गैसों की लगातार निगरानी।',
    hazard_air_desc: 'हानिकारक पर्यावरणीय बदलावों की पहचान के लिए पार्टिकुलेट मैटर और वायु गुणवत्ता सूचकांकों की निगरानी।',
    cta_title: 'नेटवर्क को नियंत्रित करें।',
    cta_desc: 'टेलीमेट्री देखने, GIS खतरा मैप प्रबंधित करने और अलर्ट भेजने के लिए लाइव ऑपरेशनल डैशबोर्ड खोलें।',
    cta_button: 'डैशबोर्ड खोलें',
    technical_cta: 'पूरा तकनीकी आर्किटेक्चर देखें →',
    footer_project: 'प्रोजेक्ट',
    footer_team: 'GEN ERA टीम',
    footer_location: 'भवाली, नैनीताल',
    footer_license: 'MIT लाइसेंस',
    footer_context: 'संदर्भ',
    footer_sih: 'SIH 2026 · समस्या विवरण 26178',
    footer_tagline: 'ऑफ़लाइन-फर्स्ट पर्यावरणीय पूर्व चेतावनी।',
    footer_tagline_long: 'प्रतिरोधी पर्यावरणीय AI। जोखिमग्रस्त समुदायों के लिए स्थानीय, ऑफ़लाइन-फर्स्ट पूर्व चेतावनी प्रणालियां बनाना।',
    footer_copyright: '© 2026 ZenAlert. सर्वाधिकार सुरक्षित।',
    footer_built: 'स्थानीय प्रतिक्रिया टीमों के लिए निर्मित।',
    footer_location_short: 'भवाली · नैनीताल',
  }
};

let currentLang = localStorage.getItem('zenalert-landing-lang') || 'en';

function updateLandingLanguage(lang) {
  const dict = landingI18n[lang];
  if (!dict) return;
  document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
  document.querySelectorAll('[data-li18n]').forEach(el => {
    const key = el.getAttribute('data-li18n');
    if (dict[key]) el.textContent = dict[key];
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

  // Init animations if GSAP is loaded
  initLandingAnimations();
  settleHashNavigation();
  window.addEventListener('hashchange', settleHashNavigation);

  const homeLink = document.querySelector('.nav-brand');
  const backToTop = document.querySelector('.back-to-top');
  const returnToTop = () => {
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    root.scrollTop = 0;
    document.body.scrollTop = 0;
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      root.scrollTop = 0;
      document.body.scrollTop = 0;
      root.style.scrollBehavior = previousBehavior;
    });
  };
  if (homeLink) {
    homeLink.addEventListener('click', (event) => {
      event.preventDefault();
      history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      returnToTop();
    });
  }
  if (backToTop) {
    backToTop.addEventListener('click', returnToTop);
    window.addEventListener('scroll', () => {
      const visible = window.scrollY > 560;
      backToTop.classList.toggle('is-visible', visible);
      backToTop.setAttribute('aria-hidden', String(!visible));
    }, { passive: true });
  }

  // Handle sticky nav
  const nav = document.querySelector('.landing-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });

  }

  // Language toggle
  const langToggle = document.querySelector('.nav-lang-toggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'hi' : 'en';
      localStorage.setItem('zenalert-landing-lang', currentLang);
      updateLanguageToggle(langToggle);
      updateLandingLanguage(currentLang);
    });
  }
  updateLandingLanguage(currentLang);
  if (langToggle) updateLanguageToggle(langToggle);

  const technicalCta = document.querySelector('.technical-architecture-cta');
  if (technicalCta) {
    technicalCta.addEventListener('click', (event) => {
      event.preventDefault();
      const target = document.getElementById('architecture-deep-dive');
      if (!target) return;
      history.replaceState(null, '', '#architecture-deep-dive');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Initialize Lucide icons if loaded
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Fetch live stats for landing page hero
  try {
    const data = await fetchOverview();
    if (data) {
      updateLandingStats(data);
    }
  } catch (err) {
    console.warn('[landing] Failed to load live stats:', err);
  }
});

function updateLanguageToggle(button) {
  const isHindi = currentLang === 'hi';
  button.innerHTML = isHindi
    ? '<span>EN</span><span aria-hidden="true"> | </span><span class="lang-active">हिं</span>'
    : '<span class="lang-active">EN</span><span aria-hidden="true"> | </span><span>हिं</span>';
  button.setAttribute('aria-label', isHindi ? 'Switch to English' : 'Switch to Hindi');
  button.setAttribute('aria-pressed', String(isHindi));
  button.classList.toggle('is-hindi', isHindi);
}

function settleHashNavigation() {
  if (!window.location.hash) return;

  const target = document.getElementById(window.location.hash.slice(1));
  if (!target) return;

  const scrollToTarget = () => target.scrollIntoView({ behavior: 'auto', block: 'start' });
  requestAnimationFrame(() => {
    requestAnimationFrame(scrollToTarget);
  });
  window.setTimeout(scrollToTarget, 600);
}

function updateLandingStats(data) {
  const elNodes = document.getElementById('hero-nodes');
  const elLatency = document.getElementById('hero-latency');
  const elUptime = document.getElementById('hero-uptime');

  if (elNodes) elNodes.textContent = data.nodes_online;
  if (elLatency) elLatency.textContent = data.alert_latency_s.toFixed(1) + ' s';
  if (elUptime) elUptime.textContent = data.gateway_uptime_pct.toFixed(1) + '%';
  
  const pIncidents = document.getElementById('preview-incidents');
  const pAir = document.getElementById('preview-air');
  
  if (pIncidents) pIncidents.textContent = String(data.open_incidents).padStart(2, '0');
  if (pAir) pAir.textContent = data.avg_pm25;
}
