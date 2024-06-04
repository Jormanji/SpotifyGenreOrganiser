const express = require('express');
const { getPlaylists, getTracksByGenre } = require('../controllers/playlistController');
const router = express.Router();

router.get('/api/playlists', getPlaylists);
router.get('/api/playlists/:playlistId/tracks', getTracksByGenre);

module.exports = router;