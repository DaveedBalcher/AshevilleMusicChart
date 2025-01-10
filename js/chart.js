import { renderChartHeader } from './chartHeader.js';
import { renderArtistCells } from './artistCells.js';

export function renderChart(container, data) {
  container.innerHTML = `<div id="chart-items"></div>`;

  const chartItemsEl = container.querySelector('#chart-items');
  
  const headerDiv = document.createElement('div');
  renderChartHeader(headerDiv, 'Dec 26, 2024', 'Jan 2, 2025');
  chartItemsEl.appendChild(headerDiv);

  const cellsContainer = document.createElement('div');
  cellsContainer.classList.add('cells-container');
  chartItemsEl.appendChild(cellsContainer);

  const artistsData = data.map((artistObj, index) => ({
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

  renderArtistCells(chartItemsEl, artistsData);
}