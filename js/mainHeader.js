/**
 * mainHeader.js
 * Renders the main header section (title + subtitle), matching original design.
 */
function renderMainHeader(container) {
    const headerHTML = `
      <header class="main-header">
        <h1 class="page-title">
          Asheville<br class="mobile-break"> Music Chart
        </h1>
        <div class="subtitle">
          <h2 class="main-subtitle">Where Community Creativity Rises to the Top</h2>
        </div>
      </header>
    `;
  
    container.innerHTML = headerHTML;
  }
  
  // Expose globally or via ES module
  window.renderMainHeader = renderMainHeader;
  