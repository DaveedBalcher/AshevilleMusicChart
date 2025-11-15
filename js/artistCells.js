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
      this.rollingNumber = null;
      this.changeRollingNumber = null;
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

      // Initialize rolling number component for stream value
      const streamElement = cell.querySelector(`#${streamValueId}`);
      this.rollingNumber = new RollingNumber(streamElement, initialStreamValue);

      // Initialize change indicator with rolling number
      const changeElement = cell.querySelector(`#${changeIndicatorId}`);
      this.updateChangeIndicator(changeElement, initialChangeValue);

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

  updateChangeIndicator(changeElement, changeValue) {
      if (!this.previousWeek) {
          changeElement.innerHTML = '';
          return;
      }

      // Determine the arrow class and sign
      let arrowClass = '';
      let sign = '';

      if (changeValue > 0) {
          arrowClass = 'up-arrow';
          sign = '+';
      } else if (changeValue < 0) {
          arrowClass = 'down-arrow';
          sign = ''; // The minus sign is part of the number
      } else {
          changeElement.innerHTML = '';
          return;
      }

      // Create or update the arrow span
      let arrowSpan = changeElement.querySelector('.up-arrow, .down-arrow');

      if (!arrowSpan || !arrowSpan.classList.contains(arrowClass)) {
          // Need to recreate the structure
          changeElement.innerHTML = `<span class="${arrowClass}">
              <span class="change-sign">${sign}</span>
              <span class="change-value"></span>
          </span>`;
          arrowSpan = changeElement.querySelector(`.${arrowClass}`);

          // Initialize rolling number for change value
          const valueContainer = arrowSpan.querySelector('.change-value');
          this.changeRollingNumber = new RollingNumber(valueContainer, Math.abs(changeValue));
      } else {
          // Update existing rolling number
          if (this.changeRollingNumber) {
              this.changeRollingNumber.update(Math.abs(changeValue));
          }

          // Update sign if needed
          const signSpan = arrowSpan.querySelector('.change-sign');
          if (signSpan && signSpan.textContent !== sign) {
              signSpan.textContent = sign;
          }
      }
  }

  updateAnimatedValues() {
      if (!this.cellElement) return;

      const changeIndicatorId = `change-indicator-${this.artistData.artist.uuid}`;
      const changeElement = document.getElementById(changeIndicatorId);

      // Update rolling number with new value
      if (this.rollingNumber) {
          const animatedStreamValue = this.getAnimatedStreamValue();
          this.rollingNumber.update(animatedStreamValue);
      }

      if (changeElement) {
          const animatedChangeValue = this.getAnimatedChangeValue();
          this.updateChangeIndicator(changeElement, animatedChangeValue);
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
      if (this.rollingNumber) {
          this.rollingNumber.destroy();
          this.rollingNumber = null;
      }
      if (this.changeRollingNumber) {
          this.changeRollingNumber.destroy();
          this.changeRollingNumber = null;
      }
      this.cellElement = null;
  }
}