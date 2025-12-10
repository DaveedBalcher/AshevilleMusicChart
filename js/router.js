/**
 * router.js
 * Simple hash-based router for tab navigation
 * Provides URL routing for Top, Hottest, and Shows tabs
 */

import { trackTabView } from './analytics.js';

const VALID_TABS = ['top', 'hottest', 'shows'];
const DEFAULT_TAB = 'top';

/**
 * Extract tab name from current URL hash
 * Supports both #/tabname and #tabname formats
 * @returns {string} Valid tab name (defaults to 'top' if invalid/missing)
 */
function getTabFromHash() {
  const hash = window.location.hash;

  // Remove leading # and optional /
  const cleaned = hash.replace(/^#\/?/, '').toLowerCase();

  // Return default if empty
  if (!cleaned) return DEFAULT_TAB;

  // Validate and return
  if (VALID_TABS.includes(cleaned)) {
    return cleaned;
  }

  console.warn(`Invalid tab "${cleaned}" in URL, defaulting to "${DEFAULT_TAB}"`);
  return DEFAULT_TAB;
}

/**
 * Check if tab name is valid
 * @param {string} tabName - Tab name to validate
 * @returns {boolean} True if tab name is valid
 */
function isValidTab(tabName) {
  return VALID_TABS.includes(tabName?.toLowerCase());
}

/**
 * Navigate to a specific tab by updating the hash
 * @param {string} tabName - The tab to navigate to
 * @param {boolean} replace - If true, replace history instead of pushing
 */
function navigateToTab(tabName, replace = false) {
  if (!isValidTab(tabName)) {
    console.error(`Cannot navigate to invalid tab: ${tabName}`);
    return;
  }

  const newHash = `#/${tabName.toLowerCase()}`;

  if (replace) {
    // Replace current history entry (doesn't add to back button stack)
    window.history.replaceState(null, '', newHash);
    // Manually trigger hashchange event since replaceState doesn't
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    // Update hash (automatically adds to history and triggers hashchange)
    window.location.hash = newHash;
  }
}

/**
 * Initialize the router
 * @param {Function} onTabChange - Callback when tab changes, receives (tabName, updateHash)
 * @returns {Function} Cleanup function to remove listeners
 */
function initRouter(onTabChange) {
  // Handle hash changes (back/forward buttons, manual hash edits)
  const handleHashChange = () => {
    const tabName = getTabFromHash();
    trackTabView(tabName, 'hash_change');
    onTabChange(tabName, false); // false = don't update hash (prevent loop)
  };

  // Listen for hash changes
  window.addEventListener('hashchange', handleHashChange);

  // Get initial tab from URL
  const initialTab = getTabFromHash();

  // If no hash in URL, set default without adding history entry
  if (!window.location.hash) {
    navigateToTab(initialTab, true); // true = replace, not push
  } else {
    // If there's already a hash, just show the tab
    onTabChange(initialTab, false);
  }

  // Return cleanup function
  return () => {
    window.removeEventListener('hashchange', handleHashChange);
  };
}

// Export for ES modules
export { getTabFromHash, isValidTab, navigateToTab, initRouter, VALID_TABS, DEFAULT_TAB };

// Also expose globally for non-module scripts
window.Router = { getTabFromHash, isValidTab, navigateToTab, initRouter, VALID_TABS, DEFAULT_TAB };
