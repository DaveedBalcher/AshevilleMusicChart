// chartHeader.js (ES module version)
export function renderChartHeader(container, startDateStr, endDateStr) {
  const headerHTML = `
    <div class="chart-header">
      <h2 class="chart-title">Top Asheville Artists</h2>
      <p class="chart-date-range">
        Ranking by <strong>Spotify Listens</strong> <br>from ${startDateStr} to ${endDateStr}
      </p>
    </div>
  `;
  container.innerHTML = headerHTML;
}
