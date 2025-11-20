/**
 * mainHeader.js
 * Renders the main header section with logo, branding, and mobile hamburger menu.
 */
function renderMainHeader(container) {
    const headerHTML = `
      <header class="main-header">
        <button class="hamburger-button" aria-label="Toggle menu" aria-expanded="false">
          <span class="hamburger-icon"></span>
          <span class="hamburger-icon"></span>
          <span class="hamburger-icon"></span>
        </button>
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

    // Initialize hamburger menu toggle
    initializeHamburgerToggle();
  }

  function initializeHamburgerToggle() {
    const hamburger = document.querySelector('.hamburger-button');
    const mainMenu = document.querySelector('.main-menu');

    if (!hamburger || !mainMenu) return;

    // Toggle menu on hamburger click
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mainMenu.classList.toggle('menu-open');
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (mainMenu.classList.contains('menu-open') &&
          !mainMenu.contains(e.target) &&
          !hamburger.contains(e.target)) {
        mainMenu.classList.remove('menu-open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Expose globally or via ES module
  window.renderMainHeader = renderMainHeader;
  
