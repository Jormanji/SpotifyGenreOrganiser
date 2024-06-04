const express = require('express');
const passport = require('passport');
const router = express.Router();

// Route to start OAuth flow
router.get('/auth/spotify', passport.authenticate('spotify', {
  scope: ['user-read-email', 'user-read-private'],
  showDialog: true
}));

// Callback route after Spotify has authenticated the user
router.get('/auth/spotify/callback', 
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication
    const { accessToken, refreshToken } = req.user;
    
    // Log tokens for debugging
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);

    // Store tokens in session (or database)
    req.session.accessToken = accessToken;
    req.session.refreshToken = refreshToken;

    // Redirect to the home page with the access token in the URL
    res.redirect('/?access_token=' + accessToken);
  });

module.exports = router;