require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');
const morgan = require('morgan');

const app = express();
const port = process.env.CHAT_API_PORT || 3001;

// Middleware
app.use(morgan('dev')); // Real-time HTTP logging
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve static files

// Session & Passport
app.use(session({
    secret: 'minfoai-secret-key',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Discord Strategy
passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: `http://localhost:${port}/auth/discord/callback`,
    scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => done(null, profile));
}));

// --- AI Chat Route ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        const chat = model.startChat({
            history: history || [],
            generationConfig: { maxOutputTokens: 500 }
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        res.json({ reply: response.text() });
    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ error: 'AI processing failed' });
    }
});

// --- Auth Routes ---
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => res.redirect('/dashboard.html')
);

app.get('/logout', (req, res) => {
    req.logout(() => res.redirect('/'));
});

// --- Dashboard API ---
app.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`✅ MinfoAI Server running on http://localhost:${port}`);
});
