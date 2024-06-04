const request = require('supertest');
const app = require('../server'); // Adjust the path according to your structure
const nock = require('nock');

// Mocking the Spotify API response
const mockSpotifyResponse = {
  items: [
    {
      id: '1',
      name: 'My Playlist',
      tracks: {
        href: 'https://api.spotify.com/v1/playlists/1/tracks',
        total: 10
      }
    },
    // Add more mock playlists as needed
  ]
};

// Ensure nock is active for mocking before any tests run
beforeAll(() => {
  nock('https://api.spotify.com/v1')
    .get('/me/playlists')
    .reply(200, mockSpotifyResponse);
});

describe('GET /api/playlists', () => {
  test('Should retrieve user playlists correctly', async () => {
    const response = await request(app)
      .get('/api/playlists')
      .set('Authorization', `Bearer dummyAccessToken`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body.items).toBeInstanceOf(Array);
    expect(response.body.items.length).toBeGreaterThan(0);
    expect(response.body.items[0]).toHaveProperty('id');
    expect(response.body.items[0]).toHaveProperty('name');
    expect(response.body.items[0]).toHaveProperty('tracks');
    expect(response.body.items[0].tracks).toHaveProperty('href');
    expect(response.body.items[0].tracks).toHaveProperty('total');
  });
});