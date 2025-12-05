import { getAnimationStartTime, getAnimatedValue, createAnimationController } from './streamAnimation.js';

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

    const hasBio = Boolean(this.artistData.artist.concise_bio);

    cell.innerHTML = `
      <div class="artist-cell-main">
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
            <span class="stat-value" id="${streamValueId}">
              ${initialStreamValue.toLocaleString()}
            </span>
            <span id="${changeIndicatorId}">${this.getChangeIndicatorHTML(initialChangeValue)}</span>
          </div>
        </div>
      </div>
      ${hasBio ? `
        <button class="bio-toggle-btn"
                aria-label="Show artist bio"
                aria-expanded="false">
          <i class="fas fa-plus"></i>
        </button>
        <div class="music-service-links">
          ${this.artistData.artist.spotifyUrl ? `
            <a href="${this.artistData.artist.spotifyUrl}"
               target="_blank"
               rel="noopener noreferrer"
               class="music-service-link spotify-link-bio"
               title="Listen on Spotify"
               aria-label="Listen to ${this.artistData.artist.name} on Spotify">
              <i class="fab fa-spotify"></i>
            </a>
          ` : ''}
          ${this.artistData.artist.appleMusicUrl ? `
            <a href="${this.artistData.artist.appleMusicUrl}"
               target="_blank"
               rel="noopener noreferrer"
               class="music-service-link apple-link-bio"
               title="Listen on Apple Music"
               aria-label="Listen to ${this.artistData.artist.name} on Apple Music">
              <i class="fab fa-apple"></i>
            </a>
          ` : ''}
          ${this.artistData.artist.youtubeUrl ? `
            <a href="${this.artistData.artist.youtubeUrl}"
               target="_blank"
               rel="noopener noreferrer"
               class="music-service-link youtube-link-bio"
               title="Watch on YouTube"
               aria-label="Watch ${this.artistData.artist.name} on YouTube">
              <i class="fab fa-youtube"></i>
            </a>
          ` : ''}
          ${this.artistData.artist.tidalUrl ? `
            <a href="${this.artistData.artist.tidalUrl}"
               target="_blank"
               rel="noopener noreferrer"
               class="music-service-link tidal-link-bio"
               title="Listen on Tidal"
               aria-label="Listen to ${this.artistData.artist.name} on Tidal">
              <span class="tidal-text">T</span>
            </a>
          ` : ''}
        </div>
        <div class="bio-section">
          <div class="bio-content">
            <p class="bio-text">${this.artistData.artist.concise_bio}</p>
          </div>
        </div>
      ` : ''}
    `;

    // Start the animation
    this.startAnimation();

    // Setup bio toggle if bio exists
    if (hasBio) {
      this.setupBioToggle();
    }

      return cell;
  }

  setupBioToggle() {
    const toggleBtn = this.cellElement.querySelector('.bio-toggle-btn');
    const musicServiceLinks = this.cellElement.querySelector('.music-service-links');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isExpanded = this.cellElement.classList.contains('bio-expanded');

      if (isExpanded) {
        // Hide music service buttons immediately before collapse
        if (musicServiceLinks) {
          musicServiceLinks.classList.remove('visible');
        }

        // Collapse
        this.cellElement.classList.add('bio-collapsing');
        this.cellElement.classList.remove('bio-expanded');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.setAttribute('aria-label', 'Show artist bio');
        toggleBtn.querySelector('i').className = 'fas fa-plus';

        setTimeout(() => {
          this.cellElement.classList.remove('bio-collapsing');
        }, 300);

      } else {
        // Expand
        this.cellElement.classList.add('bio-expanded');
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.setAttribute('aria-label', 'Hide artist bio');
        toggleBtn.querySelector('i').className = 'fas fa-minus';

        // Show music service buttons after expand starts
        if (musicServiceLinks) {
          musicServiceLinks.classList.add('visible');
        }
      }
    });
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
          streamElement.textContent = animatedStreamValue.toLocaleString();
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