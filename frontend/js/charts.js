/**
 * charts.js — Chart rendering using Chart.js CDN.
 * Provides reusable chart creation functions.
 */

const chartInstances = new Map();

/**
 * Create or update a line chart.
 */
export function createLineChart(canvasId, data, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return null;

  // Destroy existing
  if (chartInstances.has(canvasId)) {
    chartInstances.get(canvasId).destroy();
  }

  const styles = getComputedStyle(document.documentElement);
  const accent = styles.getPropertyValue('--accent').trim() || '#5EEAC6';
  const textMuted = styles.getPropertyValue('--text-muted').trim() || '#4A7566';
  const borderSubtle = styles.getPropertyValue('--border-subtle').trim() || 'rgba(119,231,207,0.08)';

  const labels = data.map((_, i) => options.labels?.[i] || `${i}`);

  const datasets = Array.isArray(data[0])
    ? data.map((d, i) => ({
        label: options.datasetLabels?.[i] || `Series ${i + 1}`,
        data: d,
        borderColor: options.colors?.[i] || accent,
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.4,
      }))
    : [{
        label: options.label || 'Value',
        data: data,
        borderColor: accent,
        backgroundColor: hexToRgba(accent, 0.08),
        fill: true,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.4,
      }];

  const chart = new Chart(canvas, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: datasets.length > 1, labels: { color: textMuted, usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 11 } } },
        tooltip: {
          backgroundColor: 'rgba(11,31,26,0.95)',
          titleColor: '#E8F4F0',
          bodyColor: '#9BB8AE',
          borderColor: 'rgba(119,231,207,0.15)',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          titleFont: { family: 'Inter', weight: '600' },
          bodyFont: { family: 'JetBrains Mono', size: 12 },
        },
      },
      scales: {
        x: {
          display: options.showXAxis !== false,
          grid: { color: borderSubtle },
          ticks: { color: textMuted, font: { size: 10 }, maxRotation: 0, maxTicksLimit: 8 },
        },
        y: {
          display: true,
          grid: { color: borderSubtle },
          ticks: { color: textMuted, font: { family: 'JetBrains Mono', size: 10 }, padding: 8 },
          ...(options.thresholds ? { suggestedMax: Math.max(...options.thresholds.map(t => t.value)) * 1.1 } : {}),
        },
      },
      ...(options.thresholds ? {
        plugins: {
          ...this?.plugins,
          annotation: {
            annotations: options.thresholds.reduce((acc, t, i) => {
              acc[`threshold${i}`] = {
                type: 'line', yMin: t.value, yMax: t.value,
                borderColor: t.color || '#EF4444', borderWidth: 1,
                borderDash: [4, 4], label: { display: true, content: t.label, position: 'end' },
              };
              return acc;
            }, {}),
          },
        },
      } : {}),
    },
  });

  chartInstances.set(canvasId, chart);
  return chart;
}

/**
 * Create a doughnut chart.
 */
export function createDoughnutChart(canvasId, labels, data, colors) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return null;

  if (chartInstances.has(canvasId)) {
    chartInstances.get(canvasId).destroy();
  }

  const styles = getComputedStyle(document.documentElement);
  const textMuted = styles.getPropertyValue('--text-muted').trim() || '#4A7566';

  const chart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: textMuted, usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 11 } },
        },
        tooltip: {
          backgroundColor: 'rgba(11,31,26,0.95)',
          titleColor: '#E8F4F0',
          bodyColor: '#9BB8AE',
          borderColor: 'rgba(119,231,207,0.15)',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
        },
      },
    },
  });

  chartInstances.set(canvasId, chart);
  return chart;
}

/**
 * Create a bar chart.
 */
export function createBarChart(canvasId, labels, data, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return null;

  if (chartInstances.has(canvasId)) {
    chartInstances.get(canvasId).destroy();
  }

  const styles = getComputedStyle(document.documentElement);
  const accent = styles.getPropertyValue('--accent').trim() || '#5EEAC6';
  const textMuted = styles.getPropertyValue('--text-muted').trim() || '#4A7566';
  const borderSubtle = styles.getPropertyValue('--border-subtle').trim();

  const chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: options.label || 'Value',
        data,
        backgroundColor: options.color || hexToRgba(accent, 0.6),
        borderRadius: 4,
        borderSkipped: false,
        barPercentage: 0.6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(11,31,26,0.95)',
          titleColor: '#E8F4F0',
          bodyColor: '#9BB8AE',
          borderColor: 'rgba(119,231,207,0.15)',
          borderWidth: 1,
          cornerRadius: 8,
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: textMuted, font: { size: 10 } } },
        y: { grid: { color: borderSubtle }, ticks: { color: textMuted, font: { family: 'JetBrains Mono', size: 10 } } },
      },
    },
  });

  chartInstances.set(canvasId, chart);
  return chart;
}

/**
 * Update chart data without re-creating.
 */
export function updateChartData(canvasId, newData, newLabels) {
  const chart = chartInstances.get(canvasId);
  if (!chart) return;
  if (newLabels) chart.data.labels = newLabels;
  chart.data.datasets[0].data = newData;
  chart.update('none');
}

/**
 * Destroy a chart.
 */
export function destroyChart(canvasId) {
  if (chartInstances.has(canvasId)) {
    chartInstances.get(canvasId).destroy();
    chartInstances.delete(canvasId);
  }
}

function hexToRgba(hex, alpha) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
