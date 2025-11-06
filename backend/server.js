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


// Helper function to check if user is logged in
const isLoggedIn = (req) => {
    return req.session && req.session.username;
};

// GET Routes
app.get('/', (req, res) => {
    res.render('home', { 
        layout: 'layouts/main',
        user: req.session.username
    });
});

app.get('/register', (req, res) => {
    res.render('register', {
        layout: 'layouts/main',
        user: req.session.username,
        error: null
    });
});

app.get('/login', (req, res) => {
    res.render('login', {
        layout: 'layouts/main',
        user: req.session.username,
        error: null
    });
});

app.get('/comments', (req, res) => {
    res.render('comments', {
        layout: 'layouts/main',
        user: req.session.username,
        comments: comments
    });
});

app.get('/comment/new', (req, res) => {
    // If user is not logged in, show login form instead
    if (!isLoggedIn(req)) {
        return res.render('login', {
            layout: 'layouts/main',
            user: null,
            error: 'Please login to create a comment.'
        });
    }
    
    res.render('newComment', {
        layout: 'layouts/main',
        user: req.session.username,
        error: null
    });
});

// POST Routes
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    
    // Check if username is already taken
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        return res.render('register', {
            layout: 'layouts/main',
            user: req.session.username,
            error: 'Username is already taken. Please choose another.'
        });
    }
    
    // Create new user
    if (username && password) {
        users.push({ username, password });
        // Auto-login after registration
        req.session.username = username;
        req.session.loggedIn = true;
        res.redirect('/');
    } else {
        res.render('register', {
            layout: 'layouts/main',
            user: req.session.username,
            error: 'Username and password are required.'
        });
    }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Find user
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Set session
        req.session.username = username;
        req.session.loggedIn = true;
        res.redirect('/');
    } else {
        res.render('login', {
            layout: 'layouts/main',
            user: null,
            error: 'Invalid username or password.'
        });
    }
});

app.post('/logout', (req, res) => {
    // Clear session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/');
    });
});

app.post('/comment', (req, res) => {
    // Check if user is logged in
    if (!isLoggedIn(req)) {
        return res.render('login', {
            layout: 'layouts/main',
            user: null,
            error: 'Please login to create a comment.'
        });
    }
    
    const { text } = req.body;
    
    if (text && text.trim()) {
        // Store comment with author and text
        comments.push({
            author: req.session.username,
            text: text.trim(),
            createdAt: new Date().toISOString()
        });
        res.redirect('/comments');
    } else {
        res.render('newComment', {
            layout: 'layouts/main',
            user: req.session.username,
            error: 'Comment text is required.'
        });
    }
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

