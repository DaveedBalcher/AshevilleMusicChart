import { getAnimationStartTime, getAnimatedValue, createAnimationController } from './streamAnimation.js';

// Store previous stat values for rolling animation
const previousStats = new Map();

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

      // Get previous stat values for rolling animation
      const artistId = artistData.artist.uuid;
      this.previousStatValues = previousStats.get(artistId) || {
        totalListens: this.currentWeek.totalListens,
        change: this.previousWeek ? (this.currentWeek.totalListens - this.previousWeek.totalListens) : 0
      };

      // Store current values as previous for next update
      previousStats.set(artistId, {
        totalListens: this.currentWeek.totalListens,
        change: this.previousWeek ? (this.currentWeek.totalListens - this.previousWeek.totalListens) : 0
      });
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
                  <span class="stat-value" id="${streamValueId}">
                      ${initialStreamValue.toLocaleString()}
                  </span>
                  <span id="${changeIndicatorId}">${this.getChangeIndicatorHTML(initialChangeValue)}</span>
              </div>
          </div>
      `;

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

      const streamValueId = `stream-value-${this.artistData.artist.uuid}`;
      const changeIndicatorId = `change-indicator-${this.artistData.artist.uuid}`;

      const streamElement = document.getElementById(streamValueId);
      const changeElement = document.getElementById(changeIndicatorId);

      if (streamElement) {
          const animatedStreamValue = this.getAnimatedStreamValue();

          // Use rolling animation if value changed (and we're not in initial animation)
          if (!this.animationStartTime && window.StatRollAnimation) {
              const previousValue = this.previousStatValues.totalListens;
              const rollAnimation = new window.StatRollAnimation(
                  streamElement,
                  previousValue,
                  animatedStreamValue
              );
              rollAnimation.animate();
          } else {
              // Initial animation or fallback
              streamElement.textContent = animatedStreamValue.toLocaleString();
          }
      }

      if (changeElement) {
          const animatedChangeValue = this.getAnimatedChangeValue();
          changeElement.innerHTML = this.getChangeIndicatorHTML(animatedChangeValue);
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
      this.cellElement = null;
  }
}