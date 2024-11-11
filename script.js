document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('chart-container');

    // Sort artists by weekly Spotify listens in descending order
    data.sort((a, b) => b.weekly_spotify_listens - a.weekly_spotify_listens);

    data.forEach((artist, index) => {
        const artistElement = document.createElement('div');
        artistElement.classList.add('artist');

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
                    <span class="stat-value">${artist.weekly_spotify_listens}</span>
                    <span class="stat-label">Spotify Listens</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${artist.weekly_soundcloud_listens}</span>
                    <span class="stat-label">SoundCloud Listens</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${artist.instagram_follows}</span>
                    <span class="stat-label">Instagram Followers</span>
                </div>
            </div>
        `;

        container.appendChild(artistElement);
    });
});
