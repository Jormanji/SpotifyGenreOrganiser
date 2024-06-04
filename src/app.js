const express = require('express');
const session = require('express-session');  // Required for passport.session()
const passport = require('passport');  // Ensure passport is imported
const authRoutes = require('./routes/authRoutes');

const app = express();

// Session setup: Required for persistent login sessions
app.use(session({
    secret: 'secret',  // Replace 'secret' with a real secret key
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }  // Set to true if using HTTPS, important for production
}));

// Passport initialization and session connection
require('./config/passport-setup');
app.use(passport.initialize());
app.use(passport.session());

// Use routes
app.use('/', authRoutes);  // Adjust if you want all routes to start with a specific path

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));