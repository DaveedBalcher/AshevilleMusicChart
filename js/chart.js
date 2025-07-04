import { renderChartHeader } from './chartHeader.js';
import { renderArtistCells } from './artistCells.js';
import { formatDate, formatEndDate } from './dateFormatting.js';
import { FilterService } from './filterService.js';
import { FilterButton } from './filterButton.js';
import { FilterController } from './filterController.js';
import { FilterMenu } from './filterMenu.js';

export function renderChart(container, data) {
  container.innerHTML = `<div id="chart-items"></div>`;

  const chartItemsEl = container.querySelector('#chart-items');
  
  // Get the last week's dates from the first artist's data
  const lastWeek = data[0].weeks[data[0].weeks.length - 1];
  const startDate = formatDate(lastWeek.weekStartDate);
  const endDate = formatEndDate(lastWeek.weekStartDate, lastWeek.weekEndDate);
  
  const headerDiv = document.createElement('div');
  renderChartHeader(headerDiv, startDate, endDate);
  chartItemsEl.appendChild(headerDiv);

  const cellsContainer = document.createElement('div');
  cellsContainer.classList.add('cells-container');
  chartItemsEl.appendChild(cellsContainer);

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
  });
}

