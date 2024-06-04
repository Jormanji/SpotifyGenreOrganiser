const axios = require('axios');
const { refreshAccessToken } = require('../services/tokenService');

const getPlaylists = async (req, res) => {
  let accessToken = req.session.accessToken;
  const refreshToken = req.session.refreshToken;

  // Log the tokens for debugging
  console.log('Stored Access Token:', accessToken);
  console.log('Stored Refresh Token:', refreshToken);

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const playlists = response.data.items;
    res.status(200).json(playlists);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // Access token expired, refresh it
      try {
        accessToken = await refreshAccessToken(refreshToken);
        req.session.accessToken = accessToken;

        // Retry the request with the new access token
        const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        res.status(200).json(response.data.items);
      } catch (refreshError) {
        console.error('Failed to refresh access token:', refreshError);
        res.status(500).json({ message: 'Failed to refresh access token' });
      }
    } else {
      console.error('Error fetching playlists:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

const getTracksByGenre = async (req, res) => {
  const playlistId = req.params.playlistId;
  let accessToken = req.session.accessToken;
  const refreshToken = req.session.refreshToken;

  try {
    const tracksResponse = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const tracks = tracksResponse.data.items;

    // Fetch genres for each track
    const tracksWithGenres = await Promise.all(tracks.map(async (trackItem) => {
      const track = trackItem.track;
      const artistId = track.artists[0].id;

      const artistResponse = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const artist = artistResponse.data;
      const genres = artist.genres;

      return { track, genres };
    }));

    // Group tracks by genre
    const tracksByGenre = tracksWithGenres.reduce((acc, item) => {
      item.genres.forEach((genre) => {
        if (!acc[genre]) {
          acc[genre] = [];
        }
        acc[genre].push(item.track);
      });
      return acc;
    }, {});

    res.status(200).json({ tracksByGenre });
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // Access token expired, refresh it
      try {
        accessToken = await refreshAccessToken(refreshToken);
        req.session.accessToken = accessToken;

        // Retry the request with the new access token
        const tracksResponse = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        const tracks = tracksResponse.data.items;

        // Fetch genres for each track
        const tracksWithGenres = await Promise.all(tracks.map(async (trackItem) => {
          const track = trackItem.track;
          const artistId = track.artists[0].id;

          const artistResponse = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });

          const artist = artistResponse.data;
          const genres = artist.genres;

          return { track, genres };
        }));

        // Group tracks by genre
        const tracksByGenre = tracksWithGenres.reduce((acc, item) => {
          item.genres.forEach((genre) => {
            if (!acc[genre]) {
              acc[genre] = [];
            }
            acc[genre].push(item.track);
          });
          return acc;
        }, {});

        res.status(200).json({ tracksByGenre });
      } catch (refreshError) {
        console.error('Failed to refresh access token:', refreshError);
        res.status(500).json({ message: 'Failed to refresh access token' });
      }
    } else {
      console.error('Error fetching tracks:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

module.exports = {
  getPlaylists,
  getTracksByGenre
};