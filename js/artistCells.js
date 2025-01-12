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
    
    if (this.hasHighestImprovement()) {
        cell.classList.add('highest-improver');
    }

    const onFireLabel = this.hasHighestImprovement() 
        ? '<span class="on-fire-label">🔥</span>' 
        : '';

    cell.innerHTML = `
        <div class="artist-info">
            <div class="artist-rank">${this.index + 1}</div>
            <img src="${this.artistData.artist.imageUrl}" alt="${this.artistData.artist.name}" class="artist-img" />
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