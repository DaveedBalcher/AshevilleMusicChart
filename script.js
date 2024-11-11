document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('chart-container');

    // Sort artists by current weekly Spotify listens in descending order
    data.sort((a, b) => b.weekly_spotify_listens.current - a.weekly_spotify_listens.current);

    data.forEach((artist, index) => {
        const artistElement = document.createElement('div');
        artistElement.classList.add('artist');

        function getChangeIndicator(current, previous) {
            if (previous === null) {
                return '';
            } else if (current > previous) {
                return `<span class="up-arrow"><small>+${current - previous} </small>▲</span>`;
            } else if (current < previous) {
                return `<span class="down-arrow"><small>-${previous - current} </small>▼</span>`;
            } else {
                return '';
            }
        }

        artistElement.innerHTML = `
            <div class="artist-info">
                <img src="${artist.image_url}" alt="${artist.name}" class="artist-img">
                <div class="artist-details">
                    <h2 class="artist-name">${index + 1}. ${artist.name} ${artist.isNew ? '<span class="accent">NEW!</span>' : ''}</h2>
                    <p class="genres">${artist.high_level_genre} - ${artist.specific_genre}</p>
                </div>
            </div>
            <div class="stats">
                <div class="stat-item">
                    <span class="stat-value">${artist.weekly_spotify_listens.current}</span>
                    <span class="stat-label">Spotify Listens</span>
                    ${artist.weekly_spotify_listens.previous !== null ? getChangeIndicator(artist.weekly_spotify_listens.current, artist.weekly_spotify_listens.previous) : ''}
                </div>
                <div class="stat-item">
                    <span class="stat-value">${artist.weekly_soundcloud_listens.current}</span>
                    <span class="stat-label">SoundCloud Listens</span>
                    ${artist.weekly_soundcloud_listens.previous !== null ? getChangeIndicator(artist.weekly_soundcloud_listens.current, artist.weekly_soundcloud_listens.previous) : ''}
                </div>
                <div class="stat-item">
                    <span class="stat-value">${artist.instagram_follows.current}</span>
                    <span class="stat-label">Instagram Followers</span>
                    ${artist.instagram_follows.previous !== null ? getChangeIndicator(artist.instagram_follows.current, artist.instagram_follows.previous) : ''}
                </div>
            </div>
        `;

        container.appendChild(artistElement);
    });
});