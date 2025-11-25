import { renderArtistCells } from './artistCells.js';
import { formatDate } from './dateFormatting.js';
import { InlineAlert } from './inlineAlert.js';

export function renderChart(container, data, options = {}) {
  container.innerHTML = `<div id="chart-items"></div>`;

  const chartItemsEl = container.querySelector('#chart-items');

  const { displayWeekStart = null, displayWeekEnd = null, timestamp = null } = options;

  const stickyHeader = document.querySelector('.sticky-header');
  if (stickyHeader) {
    const existingTabs = stickyHeader.querySelector('.chart-tabs');
    if (existingTabs) existingTabs.remove();
  }

  const chartTabsSection = document.createElement('div');
  chartTabsSection.className = 'chart-tabs';
  chartTabsSection.innerHTML = `
    <button class="chart-tab active" data-tab="top">Top</button>
    <button class="chart-tab" data-tab="hottest">Hottest</button>
    <button class="chart-tab" data-tab="shows">Shows</button>
  `;

  if (stickyHeader) {
    stickyHeader.appendChild(chartTabsSection);
  }

  // Create bottom navigation for mobile
  const existingBottomNav = document.querySelector('.bottom-nav');
  if (existingBottomNav) existingBottomNav.remove();

  const bottomNav = document.createElement('div');
  bottomNav.className = 'bottom-nav';
  bottomNav.innerHTML = `
    <button class="bottom-nav-item active" data-tab="top" aria-label="Top Charts">
      <i class="fas fa-trophy"></i>
    </button>
    <button class="bottom-nav-item" data-tab="hottest" aria-label="Hottest Artists">
      <i class="fas fa-fire"></i>
    </button>
    <button class="bottom-nav-item" data-tab="shows" aria-label="Local Shows">
      <i class="fas fa-calendar-alt"></i>
    </button>
  `;
  document.body.appendChild(bottomNav);

  const tabDescription = document.createElement('div');
  tabDescription.className = 'tab-description';
  chartItemsEl.appendChild(tabDescription);

  const cellsContainer = document.createElement('div');
  cellsContainer.classList.add('cells-container', 'artist-cells-container');

  const inlineAlert = new InlineAlert();
  const alertElement = inlineAlert.render();
  chartItemsEl.appendChild(alertElement);
  chartItemsEl.appendChild(cellsContainer);

  const hasData = Array.isArray(data) && data.length > 0;
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  function addDays(isoDate, days) {
    const [year, month, day] = isoDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  let startDateIso = displayWeekStart;
  let endDateIso = displayWeekEnd;

  if (!startDateIso && hasData) {
    startDateIso = data[0].weeks[data[0].weeks.length - 1].weekStartDate;
  }
  if (!endDateIso && hasData) {
    endDateIso = data[0].weeks[data[0].weeks.length - 1].weekEndDate;
  }
  if (startDateIso && !endDateIso) {
    endDateIso = addDays(startDateIso, 7);
  }

  const hasDisplayRange = Boolean(startDateIso && endDateIso);
  const formattedStartDate = startDateIso ? formatDate(startDateIso) : '';

  // Banner for Top tab (same for desktop and mobile)
  const topBanner = hasDisplayRange
    ? `<div class="avl-top-banner">
      <i class="fas fa-trophy banner-icon"></i>
      <h2 class="avl-banner-title">AVL Top 10</h2>
      <p class="avl-banner-subtitle">Week of ${formattedStartDate}</p>
      <div class="avl-banner-buttons">
        <i class="fas fa-info-circle info-icon" role="button" tabindex="0" aria-label="Show ranking information"></i>
        <button class="share-button" aria-label="Share this chart">
          <i class="fas fa-share-alt"></i>
        </button>
      </div>
    </div>`
    : `<div class="avl-top-banner">
      <i class="fas fa-trophy banner-icon"></i>
      <h2 class="avl-banner-title">AVL Top 10</h2>
      <p class="avl-banner-subtitle">Chart data is missing right now</p>
    </div>`;

  // Banner for Hottest tab (same for desktop and mobile)
  const hottestBanner = hasDisplayRange
    ? `<div class="avl-hottest-banner">
      <i class="fas fa-fire banner-icon"></i>
      <h2 class="avl-banner-title">AVL Hottest</h2>
      <p class="avl-banner-subtitle">Week of ${formattedStartDate}</p>
      <div class="avl-banner-buttons">
        <i class="fas fa-info-circle info-icon" role="button" tabindex="0" aria-label="Show ranking information"></i>
        <button class="share-button" aria-label="Share this chart">
          <i class="fas fa-share-alt"></i>
        </button>
      </div>
    </div>`
    : `<div class="avl-hottest-banner">
      <i class="fas fa-fire banner-icon"></i>
      <h2 class="avl-banner-title">AVL Hottest</h2>
      <p class="avl-banner-subtitle">Chart data is missing right now</p>
    </div>`;

  // Banner for Shows tab (same for desktop and mobile)
  const showsBanner = `<div class="avl-shows-banner">
      <i class="fas fa-calendar-alt banner-icon"></i>
      <h2 class="avl-banner-title">AVL Shows</h2>
      <p class="avl-banner-subtitle">${currentMonth}</p>
    </div>`;

  const tabDescriptions = {
    top: topBanner,
    hottest: hottestBanner,
    shows: showsBanner
  };

  function renderEmptyState(message = 'Chart data is missing right now. Try rerunning the update or refresh later.') {
    cellsContainer.innerHTML = `
      <div class="chart-empty-state">
        <p class="chart-empty-state__message">${message}</p>
      </div>
    `;
  }

  const sortedData = hasData
    ? [...data].sort((a, b) => {
        const aListens = a.weeks[a.weeks.length - 1].totalListens;
        const bListens = b.weeks[b.weeks.length - 1].totalListens;
        return bListens - aListens;
      })
    : [];

  const artistsData = hasData
    ? sortedData.map((artistObj, index) => ({
        ...artistObj,
        index,
        getChangeIndicator: function() {
          const weeks = this.weeks || [];
          if (weeks.length < 2) return '';
          const currentWeek = weeks[weeks.length - 1];
          const previousWeek = weeks[weeks.length - 2];
          const diff = currentWeek.totalListens - previousWeek.totalListens;
          if (diff > 0) {
            return `<span class="up-arrow"><i class="fas fa-arrow-up"></i> +${diff.toLocaleString()}</span>`;
          } else if (diff < 0) {
            return `<span class="down-arrow"><i class="fas fa-arrow-down"></i> ${diff.toLocaleString()}</span>`;
          }
          return '';
        }
      }))
    : [];

  function setupInfoIcon(icon) {
    if (!icon) return;
    const toggleAlert = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (inlineAlert.isCurrentlyVisible()) {
        inlineAlert.hide();
        icon.classList.remove('active');
      } else {
        inlineAlert.show();
        icon.classList.add('active');
      }
    };
    icon.addEventListener('click', toggleAlert);
    icon.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        toggleAlert(event);
      }
    });
  }

  function setupShareButton(button) {
    if (!button) return;
    const handleShare = async (event) => {
      event.preventDefault();
      event.stopPropagation();

      const shareData = {
        title: 'Asheville Music Chart',
        text: 'Check out the Asheville Music Chart!',
        url: window.location.href
      };

      // Try Web Share API first (mobile devices)
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          // User cancelled or error occurred
          if (err.name !== 'AbortError') {
            console.log('Share failed:', err);
          }
        }
      } else {
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          // Show brief success feedback
          const originalHTML = button.innerHTML;
          button.innerHTML = '<i class="fas fa-check"></i>';
          button.classList.add('share-success');
          setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('share-success');
          }, 1500);
        } catch (err) {
          console.log('Copy to clipboard failed:', err);
        }
      }
    };

    button.addEventListener('click', handleShare);
  }


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

  const tabs = chartTabsSection.querySelectorAll('.chart-tab');
  const bottomNavItems = bottomNav.querySelectorAll('.bottom-nav-item');

  function showTab(tabName) {
    // Update desktop tabs
    tabs.forEach(tab => tab.classList.remove('active'));
    const selectedTab = chartTabsSection.querySelector(`[data-tab="${tabName}"]`);
    if (selectedTab) selectedTab.classList.add('active');

    // Update bottom nav items
    bottomNavItems.forEach(item => item.classList.remove('active'));
    const selectedBottomNavItem = bottomNav.querySelector(`[data-tab="${tabName}"]`);
    if (selectedBottomNavItem) selectedBottomNavItem.classList.add('active');

    tabDescription.innerHTML = tabDescriptions[tabName] || '';

    if (tabName === 'top') {
      cellsContainer.style.display = '';
      if (hasData) {
        cellsContainer.innerHTML = '';
        renderArtistCells(cellsContainer, sortByTop(artistsData).slice(0, 10), timestamp);
      } else {
        renderEmptyState();
      }
    } else if (tabName === 'hottest') {
      cellsContainer.style.display = '';
      if (hasData) {
        cellsContainer.innerHTML = '';
        renderArtistCells(cellsContainer, sortByImprovement(artistsData).slice(0, 10), timestamp);
      } else {
        renderEmptyState();
      }
    } else {
      cellsContainer.style.display = '';
      cellsContainer.innerHTML = '<div class="coming-soon-banner">Coming Soon</div>';
      inlineAlert.hide();
    }

    setupInfoIcon(tabDescription.querySelector('.info-icon'));
    setupShareButton(tabDescription.querySelector('.share-button'));
    if (tabName !== 'top' && tabName !== 'hottest') {
      inlineAlert.hide();
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      showTab(tab.getAttribute('data-tab'));
    });
  });

  bottomNavItems.forEach(item => {
    item.addEventListener('click', () => {
      showTab(item.getAttribute('data-tab'));
    });
  });

  showTab('top');

  window.addEventListener('beforeunload', () => {
    inlineAlert.destroy();
  });
}
