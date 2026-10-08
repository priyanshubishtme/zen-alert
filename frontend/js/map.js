/**
 * map.js — MapLibre GL map integration for ZenAlert.
 */

let map = null;
let markers = {};
let heatLayer = null;

export function initMap(containerId, center = [79.5059, 29.3947], zoom = 12.5) {
  if (map) return map;

  if (typeof maplibregl === 'undefined') {
    console.error('[map] MapLibre GL JS not loaded');
    return null;
  }

  map = new maplibregl.Map({
    container: containerId,
    style: {
      version: 8,
      sources: {
        'osm-dark': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
          ],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }
      },
      layers: [{
        id: 'osm-dark',
        type: 'raster',
        source: 'osm-dark',
        minzoom: 0,
        maxzoom: 19
      }]
    },
    center: center,
    zoom: zoom,
    pitch: 45,
    bearing: -10,
    attributionControl: false
  });

  map.addControl(new maplibregl.NavigationControl(), 'top-right');
  
  map.on('load', () => {
    // Add zone polygon
    map.addSource('zones', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: { risk: 'high' },
          geometry: {
            type: 'Polygon',
            coordinates: [[[79.52, 29.41], [79.54, 29.39], [79.51, 29.37], [79.48, 29.39], [79.52, 29.41]]]
          }
        }]
      }
    });

    map.addLayer({
      id: 'zone-layer',
      type: 'fill',
      source: 'zones',
      paint: {
        'fill-color': '#EF4444',
        'fill-opacity': 0.1
      }
    });
    
    map.addLayer({
      id: 'zone-outline',
      type: 'line',
      source: 'zones',
      paint: {
        'line-color': '#EF4444',
        'line-width': 2,
        'line-dasharray': [2, 2]
      }
    });
  });

  return map;
}

export function updateNodes(nodes) {
  if (!map) return;
  
  nodes.forEach(node => {
    if (markers[node.id]) {
      markers[node.id].remove();
    }
    
    const el = document.createElement('div');
    el.className = `map-node-marker status-${node.status}`;
    el.innerHTML = `
      <div class="node-core"></div>
      ${node.status === 'critical' || node.status === 'high' ? '<div class="node-ring"></div>' : ''}
    `;
    
    // Custom colors mapped from status
    const colorMap = {
      'critical': '#EF4444',
      'high': '#F97316',
      'watch': '#EAB308',
      'normal': '#22C55E',
      'offline': '#6B7280'
    };
    el.style.setProperty('--node-color', colorMap[node.status] || colorMap.normal);
    
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([node.lon, node.lat])
      .setPopup(new maplibregl.Popup({ offset: 15, closeButton: false })
        .setHTML(`<div class="map-popup">
          <strong>${node.id}</strong><br/>
          <small>${node.zone}</small><br/>
          <span class="status-badge ${node.status}">${node.status.toUpperCase()}</span>
        </div>`))
      .addTo(map);
      
    markers[node.id] = marker;
  });
}

export function flyTo(lat, lon, zoom = 15) {
  if (!map) return;
  map.flyTo({ center: [lon, lat], zoom, essential: true });
}

export function toggleLayer(layerName, show) {
  if (!map || !map.isStyleLoaded()) return;
  
  if (layerName === 'nodes') {
    Object.values(markers).forEach(m => {
      m.getElement().style.display = show ? 'block' : 'none';
    });
  } else if (layerName === 'zones') {
    const visibility = show ? 'visible' : 'none';
    if (map.getLayer('zone-layer')) map.setLayoutProperty('zone-layer', 'visibility', visibility);
    if (map.getLayer('zone-outline')) map.setLayoutProperty('zone-outline', 'visibility', visibility);
  }
}
