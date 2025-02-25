class ArtistCell {
    constructor(artistData, index) {
        this.artistData = artistData;
        this.index = index;
        this.currentWeek = artistData.weeks[artistData.weeks.length - 1];
        this.previousWeek = artistData.weeks.length > 1 ? artistData.weeks[artistData.weeks.length - 2] : null;
    }

    render() {
        const cell = document.createElement('div');
        cell.classList.add('artist-cell');

        cell.innerHTML = `
            <div class="artist-info">
                <div class="artist-rank">${this.index + 1}</div>
                <img src="${this.artistData.artist.imageUrl}" alt="${this.artistData.artist.name}" class="artist-img" />
                <div class="artist-details">
                    <h2 class="artist-name">
                        ${this.artistData.artist.name} 
                        ${!this.previousWeek ? '<span class="accent">NEW!</span>' : ''}
                    </h2>
                    <p class="genres">${this.artistData.artist.specific_genre}</p>
                </div>
            </div>
            <div class="spotify-view">
                <a href="${this.artistData.artist.spotifyUrl}" target="_blank" rel="noopener noreferrer" class="spotify-link" title="Listen on Spotify" aria-label="Listen to ${this.artistData.artist.name} on Spotify">
                    <i class="fab fa-spotify"></i>
                </a>
                <div class="stats">
                    <div class="stat-item">
                        <span class="stat-value">${this.currentWeek.totalListens.toLocaleString()}</span>
                        ${this.getChangeIndicator()}
                    </div>
                </div>
            </div>
        `;
        return cell;
    }

    getChangeIndicator() {
        if (!this.previousWeek) return '';
        const diff = this.currentWeek.totalListens - this.previousWeek.totalListens;
        const diffFormatted = Math.abs(diff).toLocaleString();
        if (diff > 0) {
            return `<span class="up-arrow"><i class="fas fa-arrow-up"></i> <small>+${diffFormatted}</small></span>`;
        } else if (diff < 0) {
            return `<span class="down-arrow"><i class="fas fa-arrow-down"></i> <small>-${diffFormatted}</small></span>`;
        }
        return '';
    }
}

class ArtistChart {
    constructor(data) {
        this.data = data.data
        this.container = document.getElementById('chart-container');
    }

    render() {
        this.data.forEach((artistData, index) => {
            const cell = new ArtistCell(artistData, index);
            this.container.appendChild(cell.render());
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    data.data.sort((a, b) => b.weeks[b.weeks.length - 1].totalListens - a.weeks[a.weeks.length - 1].totalListens);
    new ArtistChart(data).render();
});
