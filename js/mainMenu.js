/**
 * mainMenu.js
 * Renders a dropdown menu with "Support Asheville", "Recommend an Artist", "Give Feedback".
 */
function renderMainMenu(container) {
    const menuHTML = `
      <nav class="main-menu">
        <div class="menu-links">
          <!-- SUPPORT ASHEVILLE -->
          <a
            href="https://www.belovedasheville.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="support-button"
          >
            Support Asheville
          </a>

          <!-- RECOMMEND AN ARTIST -->
          <a
            href="https://forms.gle/R81jvhUgKHBqRsVo7"
            target="_blank"
            rel="noopener noreferrer"
            class="recommend-button"
          >
            Recommend Artist
          </a>

          <!-- GIVE FEEDBACK -->
          <a
            href="https://forms.gle/kvvXWXjaGhtq1n7n6"
            target="_blank"
            rel="noopener noreferrer"
            class="feedback-button"
          >
            Give Feedback
          </a>
        </div>
      </nav>
    `;

    container.innerHTML = menuHTML;

    // Add event listener to close menu when clicking a link
    initializeMenuLinks();
  }

  function initializeMenuLinks() {
    const menuLinks = document.querySelector('.menu-links');
    const mainMenu = document.querySelector('.main-menu');
    const hamburger = document.querySelector('.hamburger-button');

    if (!menuLinks) return;

    // Close menu when clicking a link
    menuLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        // Track external navigation
        const destination = link.classList.contains('support-button') ? 'support_asheville' :
                           link.classList.contains('recommend-button') ? 'recommend_artist' :
                           link.classList.contains('feedback-button') ? 'give_feedback' : 'unknown';

        if (typeof window.gtag === 'function') {
          window.gtag('event', 'external_navigation', {
            destination: destination,
            url: link.href,
            device_type: window.innerWidth <= 768 ? 'mobile' :
                        window.innerWidth <= 1024 ? 'tablet' : 'desktop'
          });
        }

        if (mainMenu) {
          mainMenu.classList.remove('menu-open');
        }
        if (hamburger) {
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // Make the function available globally or via ES module exports
  window.renderMainMenu = renderMainMenu;
  