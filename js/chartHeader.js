export function renderChartHeader(container, startDateStr, endDateStr) {
  const isMobile = window.innerWidth <= 768;
  const headerHTML = `
    <div class="chart-header">
      <h2 class="chart-title">Top Artists (${startDateStr} to ${endDateStr})</h2>
      <div class="chart-date-range">
        <div class="content-wrapper">
          <span class="ranking-text">
            Ranked by weekly <strong>Spotify Listens</strong>
            <span class="icon-wrapper">
              <i class="fas fa-info-circle info-icon"></i>
              <span class="info-popup">
                <span class="popup-arrow"></span>
                <button class="close-info-popup" aria-label="Close">&times;</button>
                Rankings are based on global Spotify streams for artists based in the Asheville area. Updates weekly. <br>
                <br>For each artists, the number of Spotify listens is shown for the most recent week and the difference from the previous week.<br>
                <br><strong>🔥</strong> Indicates the artist with the highest percentage increase in listens from the previous week. <br>
              </span>
            </span>
          </span>
        </div>
      </div>
    </div>
  `;
  container.innerHTML = headerHTML;

  // Info-popup logic (mobile and web)
  const iconWrapper = container.querySelector('.icon-wrapper');
  const infoIcon = container.querySelector('.info-icon');
  const infoPopup = container.querySelector('.info-popup');
  const closeBtn = container.querySelector('.close-info-popup');
  const popupArrow = container.querySelector('.popup-arrow');
  let popupOpen = false;

  function openPopup() {
    iconWrapper.classList.add('active');
    infoPopup.style.visibility = 'visible';
    infoPopup.style.opacity = '1';
    popupOpen = true;
    // On mobile, position the arrow to point to the icon
    if (window.innerWidth <= 768 && popupArrow && infoIcon && infoPopup) {
      // Get icon center X in viewport
      const iconRect = infoIcon.getBoundingClientRect();
      const iconCenterX = iconRect.left + iconRect.width / 2;
      // Get popup left in viewport
      const popupRect = infoPopup.getBoundingClientRect();
      // Set arrow left relative to popup
      const left = iconCenterX - popupRect.left;
      popupArrow.style.left = `${left}px`;
      popupArrow.style.transform = 'translateX(-50%)';
    }
  }
  function closePopup() {
    iconWrapper.classList.remove('active');
    infoPopup.style.visibility = 'hidden';
    infoPopup.style.opacity = '0';
    popupOpen = false;
  }
  infoIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    if (popupOpen) {
      closePopup();
    } else {
      openPopup();
    }
  });
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closePopup();
  });
  document.addEventListener('click', (e) => {
    if (popupOpen && !iconWrapper.contains(e.target)) {
      closePopup();
    }
  });
  // Start closed
  closePopup();
}