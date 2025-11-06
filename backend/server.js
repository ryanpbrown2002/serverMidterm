const express = require('express');
const path = require('path');
const hbs = require('hbs');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;

// In-memory data storage
const users = [];
const comments = [];

// Set up Handlebars
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Register partials directory
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Remove static file serving - nginx will handle this
// app.use(express.static('public')); // Remove this line


// Session middleware (intentionally insecure for this project)
app.use(session({
    secret: 'wild-west-secret',  // Intentionally weak
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }     // Intentionally insecure (no HTTPS required)
}));

// Serve static files (CSS, JS, images)
app.use(express.static('public'));


// API Routes
// Note: We don't include '/api' in our routes because nginx strips it when forwarding
// nginx receives: http://localhost/api/users
// nginx forwards to: http://backend-nodejs:3000/users (without /api)
app.get('/', (req, res) => {
    res.render('home',{ 
        layout: 'layouts/main',
        user: req.session.username
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        service: 'nodejs-backend'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

