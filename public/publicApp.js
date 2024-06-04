document.addEventListener('DOMContentLoaded', () => {
  // Function to get query parameter from URL
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  const accessToken = getQueryParam('access_token');

  // Log the access token for debugging
  console.log('Access Token:', accessToken);

  document.getElementById('fetchPlaylists').addEventListener('click', async () => {
    if (!accessToken) {
      console.error('Access token is missing');
      alert('Access token is missing. Please log in again.');
      return;
    }

    try {
      const response = await fetch('/api/playlists', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(data); // Handle and display the playlists data

      // Example of rendering the playlists
      const playlistContainer = document.getElementById('playlistContainer');
      playlistContainer.innerHTML = '';

      data.forEach(playlist => {
        const playlistElement = document.createElement('div');
        playlistElement.classList.add('playlist');

        const playlistImage = playlist.images[0] ? `<img src="${playlist.images[0].url}" alt="${playlist.name}">` : '';
        playlistElement.innerHTML = `
          ${playlistImage}
          <h3>${playlist.name}</h3>
          <p>${playlist.tracks.total} tracks</p>
          <a href="${playlist.external_urls.spotify}" target="_blank">View on Spotify</a>
          <button class="showTracksBtn" data-playlist-id="${playlist.id}">Show Tracks</button>
        `;

        const genresContainer = document.createElement('div');
        genresContainer.classList.add('genres');
        genresContainer.style.display = 'none';
        playlistElement.appendChild(genresContainer);

        playlistContainer.appendChild(playlistElement);
      });

      // Add event listeners for showTracksBtn
      document.querySelectorAll('.showTracksBtn').forEach(button => {
        button.addEventListener('click', async (event) => {
          const playlistId = event.target.getAttribute('data-playlist-id');
          const genresContainer = event.target.nextElementSibling;

          if (genresContainer.style.display === 'none') {
            // Fetch and display tracks organized by genre
            try {
              const tracksResponse = await fetch(`/api/playlists/${playlistId}/tracks`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${accessToken}`
                }
              });

              if (!tracksResponse.ok) {
                throw new Error('Network response was not ok');
              }

              const tracksData = await tracksResponse.json();
              console.log(tracksData);

              // Display tracks organized by genre
              genresContainer.innerHTML = '';

              Object.keys(tracksData.tracksByGenre).forEach(genre => {
                const genreElement = document.createElement('div');
                genreElement.classList.add('genre');
                genreElement.innerHTML = `<h4>${genre}</h4>`;

                const tracksList = document.createElement('ul');
                tracksData.tracksByGenre[genre].forEach(track => {
                  const trackElement = document.createElement('li');
                  trackElement.textContent = track.name;
                  tracksList.appendChild(trackElement);
                });

                genreElement.appendChild(tracksList);
                genresContainer.appendChild(genreElement);
              });

              genresContainer.style.display = 'block';
              event.target.textContent = 'Hide Tracks';
            } catch (error) {
              console.error('Failed to fetch tracks:', error);
              alert('Failed to fetch tracks. Please try again later.');
            }
          } else {
            genresContainer.style.display = 'none';
            event.target.textContent = 'Show Tracks';
          }
        });
      });
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
      alert('Failed to fetch playlists. Please try again later.');
    }
  });
});