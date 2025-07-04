export function renderArtistCells(container, artistsData) {
  // Calculate max improvement rate first
  const maxImprovement = Math.max(...artistsData.map(artist => {
      const currentWeek = artist.weeks[artist.weeks.length - 1];
      const previousWeek = artist.weeks.length > 1 ? artist.weeks[artist.weeks.length - 2] : null;
      if (!previousWeek) return 0;
      
      const diff = currentWeek.totalListens - previousWeek.totalListens;
      return diff / currentWeek.totalListens;
  }));

  artistsData.forEach((artistData, index) => {
      const cell = new ArtistCell(artistData, index, maxImprovement);
      container.appendChild(cell.render());
  });
}

class ArtistCell {
  constructor(artistData, index, maxImprovement) {
      this.artistData = artistData;
      this.index = index;
      this.currentWeek = artistData.weeks[artistData.weeks.length - 1];
      this.previousWeek = artistData.weeks.length > 1 ? 
          artistData.weeks[artistData.weeks.length - 2] : null;
      this.maxImprovement = maxImprovement;
      this.improvementRate = this.calculateImprovementRate();
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

    const onFireLabel = this.hasHighestImprovement() 
        ? '<span class="on-fire-label">🔥</span>' 
        : '';

    const imgClass = 'artist-img' + (this.hasHighestImprovement() ? ' highest-improver' : '');

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
                  <span class="stat-value">
                      ${this.currentWeek.totalListens.toLocaleString()}
                  </span>
                  ${this.getChangeIndicator()}
              </div>
          </div>
      `;
      return cell;
  }

  getChangeIndicator() {
      if (!this.previousWeek) return '';
      
      const diff = this.currentWeek.totalListens - this.previousWeek.totalListens;
      
      if (diff > 0) {
          return `<span class="up-arrow">
              <i class="fas fa-arrow-up"></i> +${diff.toLocaleString()}
          </span>`;
      } 
      
      if (diff < 0) {
          return `<span class="down-arrow">
              <i class="fas fa-arrow-down"></i> ${diff.toLocaleString()}
          </span>`;
      }
      
      return '';
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