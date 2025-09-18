import { renderArtistCells } from './artistCells.js';
import { formatDate, formatEndDate } from './dateFormatting.js';
import { FilterService } from './filterService.js';
import { FilterButton } from './filterButton.js';
import { FilterController } from './filterController.js';
import { InlineAlert } from './inlineAlert.js';

export function renderChart(container, data, options = {}) {
  container.innerHTML = `<div id="chart-items"></div>`;

  const chartItemsEl = container.querySelector('#chart-items');

  const { displayWeekStart = null, displayWeekEnd = null } = options;

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

  const tabDescription = document.createElement('div');
  tabDescription.className = 'tab-description';
  chartItemsEl.appendChild(tabDescription);

  const cellsContainer = document.createElement('div');
  cellsContainer.classList.add('cells-container', 'artist-cells-container');

  const inlineAlert = new InlineAlert(() => {
    cellsContainer.classList.remove('alert-space');
  });
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
  const formattedEndDate = hasDisplayRange ? formatEndDate(startDateIso, endDateIso) : '';
  const dateRangeMarkup = hasDisplayRange
    ? `<span class="date-range-text">(${formattedStartDate} to ${formattedEndDate})</span>`
    : '';

  const tabDescriptions = hasData
    ? {
        top: `<div class="content-wrapper">
      <span class="icon-wrapper">
        <i class="fas fa-info-circle info-icon" role="button" tabindex="0" aria-label="Show ranking information"></i>
      </span>
      <span class="ranking-text">
        Ranked by Weekly <strong>Spotify</strong> Streams
      </span>
      ${dateRangeMarkup}
    </div>`,
        hottest: `<div class="content-wrapper">
      <span class="icon-wrapper">
        <i class="fas fa-info-circle info-icon" role="button" tabindex="0" aria-label="Show ranking information"></i>
      </span>
      <span class="ranking-text">
        Artists with the Biggest Weekly Growth
      </span>
      ${dateRangeMarkup}
    </div>`,
        shows: `<div class="content-wrapper shows-tab">
      <span class="ranking-text">
        Local Shows for <span class="date-range-text">(${currentMonth})</span>
      </span>
    </div>`
      }
    : {
        top: `<div class="content-wrapper">
      <span class="ranking-text">Chart data is missing right now. Try rerunning the update or refresh later.</span>
    </div>`,
        hottest: `<div class="content-wrapper">
      <span class="ranking-text">Chart data is missing right now. Try rerunning the update or refresh later.</span>
    </div>`,
        shows: `<div class="content-wrapper shows-tab">
      <span class="ranking-text">
        Local Shows for <span class="date-range-text">(${currentMonth})</span>
      </span>
    </div>`
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

  const filterService = new FilterService();
  const filterButton = new FilterButton(() => {
    filterController.handleFilterButtonClick();
  });

  const filterController = new FilterController(
    filterService,
    filterButton,
    (filteredData) => {
      if (!filteredData.length) {
        renderEmptyState(hasData ? 'No artists match the current filters yet.' : undefined);
        return;
      }
      cellsContainer.innerHTML = '';
      renderArtistCells(cellsContainer, filteredData);
    }
  );

  if (hasData) {
    filterController.initialize(artistsData);
  }

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

  if (hasData) {
    setTimeout(() => {
      inlineAlert.show();
    }, 100);
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

  function showTab(tabName) {
    tabs.forEach(tab => tab.classList.remove('active'));
    const selectedTab = chartTabsSection.querySelector(`[data-tab="${tabName}"]`);
    if (selectedTab) selectedTab.classList.add('active');

    tabDescription.innerHTML = tabDescriptions[tabName] || '';

    if (tabName === 'top') {
      cellsContainer.style.display = '';
      if (hasData) {
        cellsContainer.innerHTML = '';
        renderArtistCells(cellsContainer, sortByTop(artistsData));
      } else {
        renderEmptyState();
      }
    } else if (tabName === 'hottest') {
      cellsContainer.style.display = '';
      if (hasData) {
        cellsContainer.innerHTML = '';
        renderArtistCells(cellsContainer, sortByImprovement(artistsData));
      } else {
        renderEmptyState();
      }
    } else {
      cellsContainer.style.display = '';
      cellsContainer.innerHTML = '<div class="coming-soon-banner">Coming Soon</div>';
      inlineAlert.hide();
    }

    setupInfoIcon(tabDescription.querySelector('.info-icon'));
    if (tabName !== 'top' && tabName !== 'hottest') {
      inlineAlert.hide();
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      showTab(tab.getAttribute('data-tab'));
    });
  });

  showTab('top');

  if (typeof window !== 'undefined' && window.setupJumpingSpotifyOnScroll) {
    window.setupJumpingSpotifyOnScroll();
  }

  window.addEventListener('resize', () => {
    filterController.handleResize();
  });

  window.addEventListener('beforeunload', () => {
    filterController.destroy();
    inlineAlert.destroy();
  });
}
