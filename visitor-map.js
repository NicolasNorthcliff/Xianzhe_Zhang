
(() => {
  'use strict';

  const svg = document.getElementById('visitorWorldSvg');
  const dots = document.getElementById('visitorDots');
  const button = document.getElementById('locateVisitor');
  const status = document.getElementById('mapStatus');
  const message = document.getElementById('mapMessage');
  const location = document.getElementById('mapLocation');
  const tooltip = document.getElementById('visitorTooltip');

  const mount = document.getElementById('providerMapMount');
  const section = document.getElementById('providerMapSection');
  const tracking = document.getElementById('trackingStatus');

  const cfg = window.VISITOR_MAP_CONFIG || {};

  const valid = (url) =>
    typeof url === 'string' &&
    /^https:\/\//i.test(url);

  // 1. Display the real visitor map when configured.
  if (mount && section) {
    const iframe = cfg.providerIframeUrl;
    const image = cfg.providerImageUrl;
    const script = cfg.providerScriptUrl;

    if (valid(iframe) || valid(image) || valid(script)) {
      section.hidden = false;

      // Hide the old SVG map.
      const demo = svg?.closest('.live-map-stage');
      if (demo) demo.hidden = true;

      // Hide the old location button.
      const currentVisit = button?.closest('.map-info-row');
      if (currentVisit) currentVisit.hidden = true;

      // Hide unnecessary status labels.
      const header = document.querySelector('.visitor-header');
      if (header) header.hidden = true;

      if (tracking) tracking.textContent = '';

      // Remove old widgets before mounting.
      mount.replaceChildren();

      if (valid(iframe)) {
        const el = document.createElement('iframe');
        el.src = iframe;
        el.title = 'Visitors around the world';
        el.loading = 'lazy';
        el.style.width = '100%';
        el.style.height = '420px';
        el.style.border = 'none';
        el.referrerPolicy = 'strict-origin-when-cross-origin';
        mount.appendChild(el);

      } else if (valid(image)) {
        const el = document.createElement('img');
        el.src = image;
        el.alt = 'Visitor world map';
        el.style.width = '100%';
        el.style.height = 'auto';
        el.loading = 'lazy';
        mount.appendChild(el);

      } else if (valid(script)) {
        const el = document.createElement('script');

        el.id = 'mmvst_globe';
        el.src = script;
        el.async = true;
        el.referrerPolicy = 'strict-origin-when-cross-origin';

        el.onerror = () => {
          mount.textContent = 'Visitor map unavailable.';
        };

        mount.appendChild(el);
      }

      return;
    }
  }

  // 2. Fallback: show the current visitor's location.
  if (!svg || !dots || !button) return;

  const NS = 'http://www.w3.org/2000/svg';

  const make = (tag, attrs = {}) => {
    const node = document.createElementNS(NS, tag);

    Object.entries(attrs).forEach(([key, value]) => {
      node.setAttribute(key, value);
    });

    return node;
  };

  const projected = (lat, lon) => ({
    x: ((lon + 180) / 360) * 1000,
    y: ((90 - lat) / 180) * 450
  });

  function showDot(lat, lon, label) {
    dots.replaceChildren();

    const { x, y } = projected(lat, lon);

    const halo = make('circle', {
      cx: x,
      cy: y,
      r: 16,
      fill: '#d6d1c4',
      opacity: '.12'
    });

    const ring = make('circle', {
      cx: x,
      cy: y,
      r: 9,
      fill: 'none',
      stroke: '#e8e4d8',
      'stroke-width': 1,
      opacity: '.65'
    });

    const dot = make('circle', {
      cx: x,
      cy: y,
      r: 4.7,
      fill: '#f3eee1',
      stroke: '#121212',
      'stroke-width': 1.4
    });

    const title = make('title');
    title.textContent = label;

    dot.appendChild(title);
    dots.append(halo, ring, dot);

    if (tooltip) {
      tooltip.hidden = false;
      tooltip.textContent = '● ' + label;
      tooltip.style.left =
        Math.max(7, Math.min(85, x / 10)) + '%';
      tooltip.style.top =
        Math.max(8, Math.min(83, y / 4.5 - 11)) + '%';
    }
  }

  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = 'Locating…';

    if (status) status.textContent = 'LOCATING';
    if (message) message.textContent = 'Locating…';

    try {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        8000
      );

      let response;

      try {
        response = await fetch('https://ipwho.is/', {
          signal: controller.signal,
          cache: 'no-store'
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) {
        throw new Error('Location unavailable');
      }

      const data = await response.json();
      const lat = Number(data.latitude);
      const lon = Number(data.longitude);

      if (
        data.success !== true ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lon) ||
        Math.abs(lat) > 90 ||
        Math.abs(lon) > 180
      ) {
        throw new Error('Invalid location');
      }

      const label = [
        data.city,
        data.region,
        data.country
      ].filter(Boolean).join(', ');

      showDot(lat, lon, label);

      if (location) location.textContent = label;
      if (message) message.textContent = 'Approximate location';
      if (status) status.textContent = 'LOCATED';

      button.textContent = 'Refresh location ↗';

    } catch (error) {
      if (status) status.textContent = 'UNAVAILABLE';
      if (message) message.textContent = 'Location unavailable';

      button.textContent = 'Retry ↗';

    } finally {
      button.disabled = false;
    }
  });
})();
