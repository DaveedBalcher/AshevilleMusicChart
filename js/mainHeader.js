/**
 * mainHeader.js
 * Renders the main header section with logo and branding.
 */
function renderMainHeader(container) {
    const headerHTML = `
      <header class="main-header">
        <div class="amc-header">
          <img src="assets/asheville-music-chart-logo.png" alt="Asheville Music Chart Logo" class="amc-logo" />
          <div class="powered-by">
            <span class="powered-by-text">Powered by</span>
            <a
              href="https://soundcharts.com/"
              class="powered-by-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Soundcharts"
            >
              <span class="powered-by-logo" aria-hidden="true"></span>
            </a>
          </div>
        </div>
      </header>
    `;
  
    container.innerHTML = headerHTML;
  }
  
  // Expose globally or via ES module
  window.renderMainHeader = renderMainHeader;
  
