const express = require('express');
const path = require('path');
const hbs = require('hbs');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;

// In-memory data storage
const users = [];
const comments = [];
const sessions = {}; // Store sessions in server memory: { sessionId: { username, sessionId, expires } }

// Set up Handlebars
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Register partials directory
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Remove static file serving - nginx will handle this
// app.use(express.static('public')); // Remove this line

// Serve static files (CSS, JS, images)
app.use(express.static('public'));


// Helper function to generate session ID
const generateSessionId = () => {
    return crypto.randomBytes(16).toString('hex');
};

// Helper function to check if user is logged in
const isLoggedIn = (req) => {
    // Check for session cookie
    const sessionId = req.cookies.sessionId;
    if (!sessionId) {
        return false;
    }
    
    // Check if session exists in memory
    const session = sessions[sessionId];
    if (!session) {
        return false;
    }
    
    // Check if session has expired
    if (new Date() > new Date(session.expires)) {
        delete sessions[sessionId];
        return false;
    }
    
    return true;
};

// Helper function to get username from session
const getUsername = (req) => {
    const sessionId = req.cookies.sessionId;
    if (!sessionId) {
        return null;
    }
    
    const session = sessions[sessionId];
    if (!session || new Date() > new Date(session.expires)) {
        return null;
    }
    
    return session.username;
};

// GET Routes
app.get('/', (req, res) => {
    res.render('home', { 
        layout: 'layouts/main',
        user: getUsername(req)
    });
});

app.get('/register', (req, res) => {
    res.render('register', {
        layout: 'layouts/main',
        user: getUsername(req),
        error: null
    });
});

app.get('/login', (req, res) => {
    res.render('login', {
        layout: 'layouts/main',
        user: getUsername(req),
        error: null
    });
});

app.get('/comments', (req, res) => {
    res.render('comments', {
        layout: 'layouts/main',
        user: getUsername(req),
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
        user: getUsername(req),
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
            user: getUsername(req),
            error: 'Username is already taken. Please choose another.'
        });
    }
    
    // Create new user
    if (username && password) {
        users.push({ username, password });
        // Auto-login after registration - create session
        const sessionId = generateSessionId();
        const expires = new Date();
        expires.setHours(expires.getHours() + 24); // 24 hour expiration
        
        sessions[sessionId] = {
            username: username,
            sessionId: sessionId,
            expires: expires.toISOString()
        };
        
        // Set session cookies (intentionally insecure - no signing/encryption)
        res.cookie('sessionId', sessionId, { httpOnly: false, secure: false });
        res.cookie('authenticated', 'true', { httpOnly: false, secure: false });
        res.cookie('username', username, { httpOnly: false, secure: false });
        
        res.redirect('/');
    } else {
        res.render('register', {
            layout: 'layouts/main',
            user: getUsername(req),
            error: 'Username and password are required.'
        });
    }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Find user
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Generate session ID and expiration
        const sessionId = generateSessionId();
        const expires = new Date();
        expires.setHours(expires.getHours() + 24); // 24 hour expiration
        
        // Store session in server memory
        sessions[sessionId] = {
            username: username,
            sessionId: sessionId,
            expires: expires.toISOString()
        };
        
        // Set session cookies (intentionally insecure - no signing/encryption)
        res.cookie('sessionId', sessionId, { httpOnly: false, secure: false });
        res.cookie('authenticated', 'true', { httpOnly: false, secure: false });
        res.cookie('username', username, { httpOnly: false, secure: false });
        
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
    // Get session ID from cookie
    const sessionId = req.cookies.sessionId;
    
    // Remove session from server memory
    if (sessionId && sessions[sessionId]) {
        delete sessions[sessionId];
    }
    
    // Clear session cookies
    res.clearCookie('sessionId');
    res.clearCookie('authenticated');
    res.clearCookie('username');
    
    res.redirect('/');
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
    const username = getUsername(req);
    
    if (text && text.trim()) {
        // Store comment with author and text
        comments.push({
            author: username,
            text: text.trim(),
            createdAt: new Date().toISOString()
        });
        res.redirect('/comments');
    } else {
        res.render('newComment', {
            layout: 'layouts/main',
            user: username,
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

