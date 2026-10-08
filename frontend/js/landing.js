/**
 * landing.js — Logic specific to the landing page.
 */

import { fetchOverview } from './api.js';
import { initLandingAnimations } from './animations.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Init animations if GSAP is loaded
  initLandingAnimations();

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

  // Handle theme toggles or lang toggles if needed (simplified for landing)
  const langToggle = document.querySelector('.nav-lang-toggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      // Basic mock toggle for the landing page
      const current = langToggle.textContent;
      langToggle.textContent = current === 'EN' ? 'हिं' : 'EN';
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
