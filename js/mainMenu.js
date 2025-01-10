/**
 * mainMenu.js
 * Renders a main action menu with "Support Asheville", "Recommend an Artist", "Give Feedback".
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
            Recommend an Artist
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
  }
  
  // Make the function available globally or via ES module exports
  window.renderMainMenu = renderMainMenu;
  