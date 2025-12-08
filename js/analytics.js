/**
 * Google Analytics 4 tracking module
 * Handles all custom event tracking with environment detection
 */

const GA4_CONFIG = {
  production: 'G-2CMRZC02S5',  // Asheville Music Chart - Production
  development: null  // Set to dev Measurement ID or null to disable locally
};

function getEnvironment() {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') || hostname.endsWith('.local')) {
    return 'development';
  }
  if (hostname === 'www.ashevillemusicchart.com' ||
      hostname === 'ashevillemusicchart.com') {
    return 'production';
  }
  return 'development';
}

function getMeasurementId() {
  return GA4_CONFIG[getEnvironment()];
}

function isAnalyticsEnabled() {
  return typeof window.gtag === 'function' && getMeasurementId() !== null;
}

function sendEvent(eventName, eventParams = {}) {
  if (!isAnalyticsEnabled()) {
    console.log('[Analytics - Dev]', eventName, eventParams);
    return;
  }
  try {
    window.gtag('event', eventName, eventParams);
    console.log('[Analytics]', eventName, eventParams);
  } catch (error) {
    console.error('[Analytics Error]', error);
  }
}

export function initAnalytics() {
  const env = getEnvironment();
  console.log(`[Analytics] Initializing in ${env} mode`);

  if (!getMeasurementId()) {
    console.log('[Analytics] Disabled in development');
    return;
  }

  sendPageView(window.location.pathname + window.location.hash);

  window.addEventListener('hashchange', () => {
    sendPageView(window.location.pathname + window.location.hash);
  });
}

function sendPageView(page) {
  const tab = getCurrentTab();
  sendEvent('page_view', {
    page_location: window.location.href,
    page_path: page,
    tab_name: tab,
    device_type: getDeviceType()
  });
}

function getCurrentTab() {
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  const validTabs = ['top', 'hottest', 'shows'];
  return validTabs.includes(hash) ? hash : 'top';
}

function getDeviceType() {
  const width = window.innerWidth;
  if (width <= 768) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
}

// Priority Event 4: Tab View
export function trackTabView(tabName, source = 'unknown') {
  sendEvent('tab_view', {
    tab_name: tabName,
    navigation_source: source,
    device_type: getDeviceType()
  });
}

// Priority 1: Artist Click
export function trackArtistClick(artistName, platform, rank, tab) {
  sendEvent('artist_click', {
    artist_name: artistName,
    platform: platform,
    artist_rank: rank,
    tab_name: tab,
    device_type: getDeviceType()
  });
}

// Priority 2: Share
export function trackShare(method, tab) {
  sendEvent('share', {
    method: method,
    content_type: 'chart',
    tab_name: tab,
    device_type: getDeviceType()
  });
}

// Priority 5: Bio Toggle
export function trackBioToggle(artistName, action, rank) {
  sendEvent('bio_toggle', {
    artist_name: artistName,
    action: action,
    artist_rank: rank,
    device_type: getDeviceType()
  });
}

// Priority 7: Info Toggle
export function trackInfoToggle(action, tab) {
  sendEvent('info_toggle', {
    action: action,
    tab_name: tab,
    device_type: getDeviceType()
  });
}

// Priority 6: External Navigation
export function trackExternalNav(destination, url) {
  sendEvent('external_navigation', {
    destination: destination,
    url: url,
    device_type: getDeviceType()
  });
}
