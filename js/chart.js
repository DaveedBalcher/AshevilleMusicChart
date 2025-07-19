import { renderArtistCells } from './artistCells.js';
import { formatDate, formatEndDate } from './dateFormatting.js';
import { FilterService } from './filterService.js';
import { FilterButton } from './filterButton.js';
import { FilterController } from './filterController.js';
import { FilterMenu } from './filterMenu.js';
import { InlineAlert } from './inlineAlert.js';

export function renderChart(container, data) {
  container.innerHTML = `<div id="chart-items"></div>`;

  const chartItemsEl = container.querySelector('#chart-items');
  
  // Get the last week's dates from the first artist's data
  const lastWeek = data[0].weeks[data[0].weeks.length - 1];
  const startDate = formatDate(lastWeek.weekStartDate);
  const endDate = formatEndDate(lastWeek.weekStartDate, lastWeek.weekEndDate);
  
  // Create chart tabs section
  const chartTabsSection = document.createElement('div');
  chartTabsSection.className = 'chart-tabs';
  chartTabsSection.innerHTML = `
    <button class="chart-tab active" data-tab="top">Top</button>
    <button class="chart-tab" data-tab="hottest">Hottest</button>
    <button class="chart-tab" data-tab="shows">Shows</button>
  `;

  // Add chart tabs to sticky header
  const stickyHeader = document.querySelector('.sticky-header');
  if (stickyHeader) {
    stickyHeader.appendChild(chartTabsSection);
  }

  // Tab descriptions for each tab
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const tabDescriptions = {
    top: `<div class="content-wrapper">
      <span class="icon-wrapper">
        <i class="fas fa-info-circle info-icon" role="button" tabindex="0" aria-label="Show ranking information"></i>
      </span>
      <span class="ranking-text">
        Ranked by Weekly <strong>Spotify</strong> Streams
      </span>
      <span class="date-range-text">(${startDate} to ${endDate})</span>
    </div>`,
    hottest: `<div class="content-wrapper">
      <span class="icon-wrapper">
        <i class="fas fa-info-circle info-icon" role="button" tabindex="0" aria-label="Show ranking information"></i>
      </span>
      <span class="ranking-text">
        Artists with the Biggest Weekly Growth
      </span>
      <span class="date-range-text">(${startDate} to ${endDate})</span>
    </div>`,
    shows: `<div class="content-wrapper">
      <span class="ranking-text">
        Local Shows for <span class="date-range-text">(${currentMonth})</span>
      </span>
    </div>`
  };

  // Create tab description (scrollable content)
  const tabDescription = document.createElement('div');
  tabDescription.className = 'tab-description';
  chartItemsEl.appendChild(tabDescription);

  // Add info icon click handler
  const infoIcon = tabDescription.querySelector('.info-icon');
  if (infoIcon) {
    infoIcon.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (inlineAlert.isCurrentlyVisible()) {
        inlineAlert.hide();
        infoIcon.classList.remove('active');
      } else {
        inlineAlert.show();
        infoIcon.classList.add('active');
      }
    });
    
    // Add keyboard support
    infoIcon.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (inlineAlert.isCurrentlyVisible()) {
          inlineAlert.hide();
          infoIcon.classList.remove('active');
        } else {
          inlineAlert.show();
          infoIcon.classList.add('active');
        }
      }
    });
  }

  // Create inline alert
  const inlineAlert = new InlineAlert(() => {
    // When alert is closed, animate artist cells up
    cellsContainer.classList.remove('alert-space');
  });
  const alertElement = inlineAlert.render();
  chartItemsEl.appendChild(alertElement);

  const cellsContainer = document.createElement('div');
  cellsContainer.classList.add('cells-container', 'artist-cells-container');
  chartItemsEl.appendChild(cellsContainer);

  // Show the alert when the website first loads
  setTimeout(() => {
    inlineAlert.show();
  }, 100); // Small delay to ensure DOM is ready

  const sortedData = data.sort((a, b) => {
    const aListens = a.weeks[a.weeks.length - 1].totalListens;
    const bListens = b.weeks[b.weeks.length - 1].totalListens;
    return bListens - aListens; // Descending order
  });

  const artistsData = sortedData.map((artistObj, index) => ({
    ...artistObj,
    index,
    getChangeIndicator: function() {
      if (!this.previousWeek) return '';
      const diff = this.currentWeek.totalListens - this.previousWeek.totalListens;
      if (diff > 0) {
        return `<span class="up-arrow"><i class="fas fa-arrow-up"></i> +${diff.toLocaleString()}</span>`;
      } else if (diff < 0) {
        return `<span class="down-arrow"><i class="fas fa-arrow-down"></i> ${diff.toLocaleString()}</span>`;
      }
      return '';
    }
  }));

  // Initialize filter system
  const filterService = new FilterService();
  const filterButton = new FilterButton(() => {
    filterController.handleFilterButtonClick();
  });
  
  const filterController = new FilterController(
    filterService,
    filterButton,
    (filteredData) => {
      // Clear existing cells
      cellsContainer.innerHTML = '';
      // Render filtered data
      renderArtistCells(cellsContainer, filteredData);
    }
  );

  // Initialize with original data and render initial cells
  filterController.initialize(artistsData);
  
  // --- Sorting Functions ---
  function sortByTop(artists) {
    return [...artists].sort((a, b) => {
      const aListens = a.weeks[a.weeks.length - 1].totalListens;
      const bListens = b.weeks[b.weeks.length - 1].totalListens;
      return bListens - aListens;
    });
  }

  function sortByImprovement(artists) {
    return [...artists]
      .filter(a => {
        const current = a.weeks[a.weeks.length - 1].totalListens;
        const prev = a.weeks.length > 1 ? a.weeks[a.weeks.length - 2].totalListens : 0;
        return (current - prev) > 0;
      })
      .sort((a, b) => {
        const aCurrent = a.weeks[a.weeks.length - 1].totalListens;
        const aPrev = a.weeks.length > 1 ? a.weeks[a.weeks.length - 2].totalListens : 0;
        const bCurrent = b.weeks[b.weeks.length - 1].totalListens;
        const bPrev = b.weeks.length > 1 ? b.weeks[b.weeks.length - 2].totalListens : 0;
        const aDiff = aCurrent - aPrev;
        const bDiff = bCurrent - bPrev;
        return bDiff - aDiff;
      });
  }

  // Tab switching logic
  const tabs = chartTabsSection.querySelectorAll('.chart-tab');
  function showTab(tabName) {
    tabs.forEach(tab => tab.classList.remove('active'));
    const selectedTab = chartTabsSection.querySelector(`[data-tab="${tabName}"]`);
    if (selectedTab) selectedTab.classList.add('active');
    tabDescription.innerHTML = tabDescriptions[tabName] || '';
    if (tabName === 'top') {
      cellsContainer.style.display = '';
      cellsContainer.innerHTML = '';
      renderArtistCells(cellsContainer, sortByTop(artistsData));
    } else if (tabName === 'hottest') {
      cellsContainer.style.display = '';
      cellsContainer.innerHTML = '';
      renderArtistCells(cellsContainer, sortByImprovement(artistsData));
    } else {
      cellsContainer.style.display = '';
      cellsContainer.innerHTML = '<div class="coming-soon-banner">Coming Soon</div>';
    }
    // Re-attach info icon event listeners for new tab description
    if (tabName === 'top' || tabName === 'hottest') {
      const infoIcon = tabDescription.querySelector('.info-icon');
      if (infoIcon) {
        infoIcon.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (inlineAlert.isCurrentlyVisible()) {
            inlineAlert.hide();
            infoIcon.classList.remove('active');
          } else {
            inlineAlert.show();
            infoIcon.classList.add('active');
          }
        });
        infoIcon.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (inlineAlert.isCurrentlyVisible()) {
              inlineAlert.hide();
              infoIcon.classList.remove('active');
            } else {
              inlineAlert.show();
              infoIcon.classList.add('active');
            }
          }
        });
      }
    } else {
      // Hide the inline alert if switching to Shows tab
      inlineAlert.hide();
    }
  }
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      showTab(tab.getAttribute('data-tab'));
    });
  });
  // Show Top tab by default
  showTab('top');

  // Setup jumping Spotify effect
  if (typeof window !== 'undefined' && window.setupJumpingSpotifyOnScroll) {
    window.setupJumpingSpotifyOnScroll();
  }

  // Handle window resize for filter system
  window.addEventListener('resize', () => {
    filterController.handleResize();
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    filterController.destroy();
    inlineAlert.destroy();
  });
}

