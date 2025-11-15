import { getAnimationStartTime, getAnimatedValue, createAnimationController } from './streamAnimation.js';
import { RollingNumber } from './rollingNumber.js';

export function renderArtistCells(container, artistsData, timestamp) {
  // Clean up any existing cells' animation controllers
  if (container._activeCells) {
    container._activeCells.forEach(cell => cell.destroy());
  }
  container._activeCells = [];

  // Calculate max improvement rate first
  const maxImprovement = Math.max(...artistsData.map(artist => {
      const currentWeek = artist.weeks[artist.weeks.length - 1];
      const previousWeek = artist.weeks.length > 1 ? artist.weeks[artist.weeks.length - 2] : null;
      if (!previousWeek) return 0;

      const diff = currentWeek.totalListens - previousWeek.totalListens;
      return diff / currentWeek.totalListens;
  }));

  artistsData.forEach((artistData, index) => {
      const cell = new ArtistCell(artistData, index, maxImprovement, timestamp);
      container.appendChild(cell.render());
      container._activeCells.push(cell);
  });
}

class ArtistCell {
  constructor(artistData, index, maxImprovement, timestamp) {
      this.artistData = artistData;
      this.index = index;
      this.currentWeek = artistData.weeks[artistData.weeks.length - 1];
      this.previousWeek = artistData.weeks.length > 1 ?
          artistData.weeks[artistData.weeks.length - 2] : null;
      this.maxImprovement = maxImprovement;
      this.improvementRate = this.calculateImprovementRate();
      this.timestamp = timestamp;
      this.animationStartTime = timestamp ? getAnimationStartTime(timestamp) : null;
      this.animationController = null;
      this.cellElement = null;
      this.rollingStreamNumber = null;
      this.rollingChangeNumber = null;
  }

  calculateImprovementRate() {
      if (!this.previousWeek) return 0;
      const diff = this.currentWeek.totalListens - this.previousWeek.totalListens;
      return diff / this.currentWeek.totalListens;
  }

  hasHighestImprovement() {
      return Math.abs(this.improvementRate - this.maxImprovement) < 0.000001;
  }

  render() {
    const cell = document.createElement('div');
    cell.classList.add('artist-cell');
    this.cellElement = cell;

    const onFireLabel = this.hasHighestImprovement()
        ? '<span class="on-fire-label">🔥</span>'
        : '';

    const imgClass = 'artist-img' + (this.hasHighestImprovement() ? ' highest-improver' : '');

    // Generate unique IDs for this cell's animated elements
    const streamValueId = `stream-value-${this.artistData.artist.uuid}`;
    const changeIndicatorId = `change-indicator-${this.artistData.artist.uuid}`;

    // Get initial animated values
    const initialStreamValue = this.getAnimatedStreamValue();
    const initialChangeValue = this.getAnimatedChangeValue();

    cell.innerHTML = `
        <div class="artist-info">
            <div class="artist-rank">${this.index + 1}</div>
            <img src="${this.artistData.artist.imageUrl}" alt="${this.artistData.artist.name}" class="${imgClass}" />
            <div class="artist-details">
                <h2 class="artist-name">
                    ${this.artistData.artist.name}
                    ${!this.previousWeek ? '<span class="accent">NEW!</span>' : ''}
                    ${onFireLabel}
                </h2>
                <p class="genres">${this.artistData.artist.specific_genre}</p>
            </div>
        </div>
          <div class="stats">
              <div class="stat-item">
                  <a href="${this.artistData.artist.spotifyUrl}"
                     target="_blank"
                     rel="noopener noreferrer"
                     class="spotify-link"
                     title="Listen on Spotify"
                     aria-label="Listen to ${this.artistData.artist.name} on Spotify">
                      <i class="fab fa-spotify"></i>
                  </a>
                  <span class="stat-value" id="${streamValueId}"></span>
                  <span id="${changeIndicatorId}"></span>
              </div>
          </div>
      `;

      // Initialize rolling numbers
      const streamElement = cell.querySelector(`#${streamValueId}`);
      const changeElement = cell.querySelector(`#${changeIndicatorId}`);

      if (streamElement) {
          this.rollingStreamNumber = new RollingNumber(streamElement, initialStreamValue);
      }

      if (changeElement && this.previousWeek) {
          changeElement.className = initialChangeValue > 0 ? 'up-arrow' : (initialChangeValue < 0 ? 'down-arrow' : '');
          const sign = initialChangeValue > 0 ? '+' : '';
          changeElement.innerHTML = `${sign}<span class="change-number"></span>`;
          const changeNumberElement = changeElement.querySelector('.change-number');
          if (changeNumberElement) {
              this.rollingChangeNumber = new RollingNumber(changeNumberElement, Math.abs(initialChangeValue));
          }
      }

      // Start the animation
      this.startAnimation();

      return cell;
  }

  getAnimatedStreamValue() {
      if (!this.animationStartTime) {
          return this.currentWeek.totalListens;
      }
      return getAnimatedValue(this.currentWeek.totalListens, this.animationStartTime);
  }

  getAnimatedChangeValue() {
      if (!this.previousWeek) return 0;

      const actualDiff = this.currentWeek.totalListens - this.previousWeek.totalListens;

      if (!this.animationStartTime) {
          return actualDiff;
      }

      return getAnimatedValue(actualDiff, this.animationStartTime);
  }

  getChangeIndicatorHTML(changeValue) {
      if (!this.previousWeek) return '';

      if (changeValue > 0) {
          return `<span class="up-arrow">
              +${changeValue.toLocaleString()}
          </span>`;
      }

      if (changeValue < 0) {
          return `<span class="down-arrow">
              ${changeValue.toLocaleString()}
          </span>`;
      }

      return '';
  }

  updateAnimatedValues() {
      if (!this.cellElement) return;

      const animatedStreamValue = this.getAnimatedStreamValue();
      const animatedChangeValue = this.getAnimatedChangeValue();

      // Update rolling stream number
      if (this.rollingStreamNumber) {
          this.rollingStreamNumber.setValue(animatedStreamValue, true);
      }

      // Update rolling change number
      if (this.rollingChangeNumber && this.previousWeek) {
          const changeIndicatorId = `change-indicator-${this.artistData.artist.uuid}`;
          const changeElement = document.getElementById(changeIndicatorId);

          if (changeElement) {
              // Update the class based on positive/negative change
              const newClass = animatedChangeValue > 0 ? 'up-arrow' : (animatedChangeValue < 0 ? 'down-arrow' : '');
              if (changeElement.className !== newClass) {
                  changeElement.className = newClass;
                  const sign = animatedChangeValue > 0 ? '+' : '';
                  changeElement.innerHTML = `${sign}<span class="change-number"></span>`;
                  const changeNumberElement = changeElement.querySelector('.change-number');
                  if (changeNumberElement) {
                      this.rollingChangeNumber.destroy();
                      this.rollingChangeNumber = new RollingNumber(changeNumberElement, Math.abs(animatedChangeValue));
                  }
              } else {
                  this.rollingChangeNumber.setValue(Math.abs(animatedChangeValue), true);
              }
          }
      }
  }

  startAnimation() {
      if (!this.animationStartTime) return;

      this.animationController = createAnimationController(() => {
          this.updateAnimatedValues();
      });

      this.animationController.start();
  }

  stopAnimation() {
      if (this.animationController) {
          this.animationController.stop();
          this.animationController = null;
      }
  }

  destroy() {
      this.stopAnimation();
      if (this.rollingStreamNumber) {
          this.rollingStreamNumber.destroy();
          this.rollingStreamNumber = null;
      }
      if (this.rollingChangeNumber) {
          this.rollingChangeNumber.destroy();
          this.rollingChangeNumber = null;
      }
      this.cellElement = null;
  }
}

// --- JUMPING SPOTIFY LINK ON MOBILE ---
function setupJumpingSpotifyOnScroll() {
  if (window.innerWidth > 768) return; // Only on mobile
  const cells = Array.from(document.querySelectorAll('.artist-cell'));
  let lastActive = null;

  function getCellCenterY(cell) {
    const rect = cell.getBoundingClientRect();
    return rect.top + rect.height / 2;
  }

  function onScroll() {
    // 33% from the top of the screen
    const triggerY = window.innerHeight * 0.33;
    let minDist = Infinity;
    let centerCell = null;
    cells.forEach(cell => {
      const centerY = getCellCenterY(cell);
      const dist = Math.abs(centerY - triggerY);
      if (dist < minDist) {
        minDist = dist;
        centerCell = cell;
      }
    });
    if (!centerCell) return;
    // Remove jumping from all
    cells.forEach(cell => {
      const spotify = cell.querySelector('.spotify-link');
      if (!spotify) return;
      if (cell === centerCell) {
        spotify.classList.add('jumping-spotify');
        spotify.classList.remove('fade-out');
      } else if (spotify.classList.contains('jumping-spotify')) {
        spotify.classList.add('fade-out');
        setTimeout(() => spotify.classList.remove('jumping-spotify', 'fade-out'), 1000);
      } else {
        spotify.classList.remove('jumping-spotify', 'fade-out');
      }
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  setTimeout(onScroll, 100); // Initial trigger after render
}

// Attach after render
if (typeof window !== 'undefined') {
  window.setupJumpingSpotifyOnScroll = setupJumpingSpotifyOnScroll;
}