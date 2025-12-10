/**
 * Google Analytics 4 tracking module
 * Handles all custom event tracking with environment detection
 */

const MEASUREMENT_ID = 'G-2CMRZC02S5';

function getMeasurementId() {
  return MEASUREMENT_ID;
}

function isAnalyticsEnabled() {
  return typeof window.gtag === 'function' && Boolean(getMeasurementId());
}

export function getAnalyticsStatus() {
  const measurementId = getMeasurementId();
  const hasGtag = typeof window.gtag === 'function';

  return {
    measurementId,
    hasGtag,
    dataLayerReady: Array.isArray(window.dataLayer),
    enabled: hasGtag && Boolean(measurementId)
  };
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
  console.log('[Analytics] Initializing');

  if (!getMeasurementId()) {
    console.warn('[Analytics] Measurement ID missing, analytics disabled');
    return;
  }

  if (!window.dataLayer) {
    console.warn('[Analytics] dataLayer not initialized—gtag may not be ready yet');
  }

  sendPageView(window.location.pathname + window.location.hash);

  window.addEventListener('hashchange', () => {
    sendPageView(window.location.pathname + window.location.hash);
  });
}

function sendPageView(page) {
  const tab = getCurrentTab();

  // Set page title based on tab
  const tabTitles = {
    'top': 'Top 10',
    'hottest': 'Hottest',
    'shows': 'Shows'
  };

  document.title = tabTitles[tab] || 'Asheville Music Chart';

  sendEvent('page_view', {
    page_location: window.location.href,
    page_path: page,
    page_title: document.title,
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

// Priority Event 4: Tab navigation
export function trackTabNavigation(tabName, source = 'unknown') {
  sendEvent('click_tab', {
    tab_name: tabName,
    navigation_source: source,
    device_type: getDeviceType()
  });
}

// Priority 2: Share
export function trackShareVisibility(action, tab) {
  const eventName = action === 'show' ? 'click_show_share' : 'click_hide_share';

  sendEvent(eventName, {
    tab_name: tab,
    device_type: getDeviceType()
  });
}

export function trackShareCompletion(method, tab) {
  sendEvent('click_shared', {
    method: method,
    content_type: 'chart',
    tab_name: tab,
    device_type: getDeviceType()
  });
}

// Priority 5: Bio Toggle
export function trackBioToggle(artistName, action, rank) {
  const eventName = action === 'expand'
    ? 'click_show_artist_detail'
    : 'click_hide_artist_detail';

  sendEvent(eventName, {
    artist_name: artistName,
    action: action,
    artist_rank: rank,
    device_type: getDeviceType()
  });
}

// Priority 7: Info Toggle
export function trackInfoToggle(action, tab) {
  const eventName = action === 'show' ? 'click_show_info' : 'click_hide_info';

  sendEvent(eventName, {
    action: action,
    tab_name: tab,
    device_type: getDeviceType()
  });
}

// Priority 6: External Navigation
export function trackExternalNav(destination, url) {
  sendEvent('click_external_navigation', {
    destination: destination,
    url: url,
    device_type: getDeviceType()
  });
}

// Music service links
export function trackMusicServiceLink(artistName, platform, rank, tab) {
  sendEvent('click_music_service', {
    artist_name: artistName,
    platform: platform,
    artist_rank: rank,
    tab_name: tab,
    device_type: getDeviceType()
  });
}
