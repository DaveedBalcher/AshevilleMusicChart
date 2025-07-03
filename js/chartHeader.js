export function renderChartHeader(container, startDateStr, endDateStr) {
  const headerHTML = `
    <div class="chart-header">
      <h2 class="chart-title">Top Artists</h2>
      <div class="chart-date-range">
        <div class="content-wrapper">
          <span class="ranking-text">
            Ranked by <strong>Spotify Listens</strong>
            <span class="icon-wrapper">
              <i class="fas fa-info-circle info-icon"></i>
              <span class="info-popup">
                Rankings are based on global Spotify streams for artists based in the Asheville area. Updates weekly. <br>
                <br>For each artists, the number of Spotify listens is shown for the most recent week and the difference from the previous week.<br>
                <br><strong>🔥</strong> Indicates the artist with the highest increase in listens from the previous week. <br>
              </span>
            </span>
          </span>
        </div>
        <div class="date-text">
          ${startDateStr} to ${endDateStr}
        </div>
      </div>
    </div>
  `;
  container.innerHTML = headerHTML;
}