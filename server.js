const express = require('express');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();  // Load environment variables
require('./src/config/passportSetup');  // Ensure passport setup is required
const authRoutes = require('./src/routes/authRoutes');  // Adjust path as necessary
const playlistRoutes = require('./src/routes/playlistRoutes'); // Ensure this is created and imported

const app = express();

// Serve static files from the "public" directory
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,  // Use the secret stored in the .env file
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // set to true in production if using HTTPS
}));

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Use routes
app.use('/', authRoutes);
app.use('/', playlistRoutes);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Export the app for testing
module.exports = app;