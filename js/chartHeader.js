// chartHeader.js (ES module version)
export function renderChartHeader(container, startDateStr, endDateStr) {
  const headerHTML = `
    <div class="chart-header">
      <h2 class="chart-title">Top Asheville Artists</h2>
      <p class="chart-date-range">
        Ranked by <strong>Spotify Listens</strong> <br>
        - ${startDateStr} to ${endDateStr} - <br>
      </p>
    </div>
  `;
  container.innerHTML = headerHTML;
}
