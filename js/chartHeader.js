export function renderChartHeader(container, startDateStr, endDateStr, onInfoClick) {
  const headerHTML = `
    <div class="chart-header">
      <h2 class="chart-title">Top Artists (${startDateStr} to ${endDateStr})</h2>
      <div class="chart-date-range">
        <div class="content-wrapper">
          <span class="ranking-text">
            Ranked by weekly <strong>Spotify Listens</strong>
            <span class="icon-wrapper">
              <i class="fas fa-info-circle info-icon" role="button" tabindex="0" aria-label="Show ranking information"></i>
            </span>
          </span>
        </div>
      </div>
    </div>
  `;
  container.innerHTML = headerHTML;

  // Add click handler for info icon
  const infoIcon = container.querySelector('.info-icon');
  if (infoIcon && onInfoClick) {
    infoIcon.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      onInfoClick();
    });
    
    // Add keyboard support
    infoIcon.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onInfoClick();
      }
    });
  }
}