/**
 * router.js — Hash-based router for the dashboard SPA.
 * No full-page reloads; pages swap via CSS class.
 */

const _routes = new Map();
const _hooks = { before: [], after: [] };
let _current = null;

/**
 * Register a route.
 * @param {string} name - Route name (e.g. 'map', 'incidents')
 * @param {object} config - { title, render, onEnter?, onLeave? }
 */
export function registerRoute(name, config) {
  _routes.set(name, config);
}

/**
 * Navigate to a route.
 */
export function navigate(name) {
  if (!_routes.has(name)) {
    console.warn(`[router] Unknown route: ${name}`);
    return;
  }
  window.location.hash = `#${name}`;
}

/**
 * Get current route name.
 */
export function currentRoute() {
  return _current;
}

/**
 * Add lifecycle hook.
 */
export function onRouteChange(hook) {
  _hooks.after.push(hook);
}

/**
 * Initialize the router — call once on DOMContentLoaded.
 */
export function initRouter(defaultRoute = 'map') {
  function handleHash() {
    const hash = window.location.hash.replace('#', '') || defaultRoute;
    const route = _routes.get(hash) || _routes.get(defaultRoute);
    const name = _routes.has(hash) ? hash : defaultRoute;

    // Leave old route
    if (_current && _routes.has(_current)) {
      const old = _routes.get(_current);
      if (old.onLeave) old.onLeave();
    }

    _current = name;

    // Show/hide pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageEl = document.getElementById(`page-${name}`);
    if (pageEl) {
      pageEl.classList.add('active');
    }

    // Update topbar title
    const titleEl = document.getElementById('pageTitle');
    if (titleEl && route.title) {
      const pageHeading = pageEl && pageEl.querySelector('.subpage-header h2');
      titleEl.textContent = pageHeading ? pageHeading.textContent.trim() : route.title;
    }

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(n => {
      n.classList.toggle('active', n.dataset.page === name);
    });

    // Render content
    if (route.render) route.render(pageEl);
    if (route.onEnter) route.onEnter(pageEl);

    // Call hooks
    _hooks.after.forEach(fn => fn(name));
  }

  window.addEventListener('hashchange', handleHash);
  handleHash();
}
