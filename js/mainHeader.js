/**
 * mainHeader.js
 * Renders the main header section (title + subtitle), matching original design.
 */
function renderMainHeader(container) {
    const headerHTML = `
      <header class="main-header">
        <div class="amc-header">
          <img src="assets/asheville-music-chart-logo.png" alt="Asheville Music Chart Logo" class="amc-logo" />
        </div>
        <div class="subtitle">
          <h2 class="main-subtitle">Where Community Creativity Rises to the Top</h2>
        </div>
      </header>
    `;
  
    container.innerHTML = headerHTML;
  }
  
  // Expose globally or via ES module
  window.renderMainHeader = renderMainHeader;
  