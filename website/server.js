require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');
const morgan = require('morgan');

// Initialize Discord Bot
require('../src/index.js');
const GuildConfig = require('../src/database/guildConfigSchema');

const app = express();
const port = process.env.CHAT_API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Session & Passport (MUST come before logging to access req.user)
app.use(session({
    secret: 'minfoai-secret-key',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Advanced Logging Middleware (AFTER passport so req.user is available)
app.use((req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toLocaleString('it-IT');

    // Improved IP extraction
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Handle multiple IPs in x-forwarded-for (take the first one)
    if (ip && ip.indexOf(',') > -1) {
        ip = ip.split(',')[0].trim();
    }

    // Clean up IPv6 prefix
    if (ip && ip.includes('::ffff:')) {
        ip = ip.replace('::ffff:', '');
    } else if (ip === '::1') {
        ip = '127.0.0.1 (Localhost)';
    }

    const userAgent = req.headers['user-agent'] || 'Unknown';
    const method = req.method;
    const url = req.url;

    // Log incoming request
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📥 [${timestamp}] ${method} ${url}`);
    console.log(`🌐 IP: ${ip}`);
    // console.log(`💻 User-Agent: ${userAgent}`); // Reduced noise

    if (req.isAuthenticated && req.isAuthenticated()) {
        console.log(`👤 User: ${req.user.username}#${req.user.discriminator || '0'} (ID: ${req.user.id})`);
    } else {
        console.log(`👤 User: Not authenticated`);
    }

    // Capture response
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
        const resetColor = '\x1b[0m';

        console.log(`📤 Response: ${statusColor}${res.statusCode}${resetColor} | ⏱️  ${duration}ms`);
        console.log(`${'='.repeat(80)}\n`);

        // Do NOT add HTTP logs to dashboard - only Discord bot logs
    });

    next();
});

// Discord Strategy
const clientID = process.env.DISCORD_CLIENT_ID;
const clientSecret = process.env.DISCORD_CLIENT_SECRET;

const isConfigured = clientID && clientSecret && clientID !== 'your_discord_client_id_here' && !clientID.includes('YOUR_CLIENT_ID');

if (isConfigured) {
    passport.use(new DiscordStrategy({
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: `http://localhost:${port}/auth/discord/callback`,
        scope: ['identify', 'guilds']
    }, (accessToken, refreshToken, profile, done) => {
        process.nextTick(() => done(null, profile));
    }));
} else {
    console.warn('⚠️ Discord Login DISABLED: Missing or invalid DISCORD_CLIENT_ID/SECRET in .env');
}

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

// --- Dashboard API (MUST BE BEFORE express.static) ---
// Log Buffer for Dashboard
const logBuffer = [];
const MAX_LOGS = 100; // Increased buffer size

function addToLogs(message) {
    const timestamp = new Date().toLocaleTimeString('it-IT');
    const logEntry = `[${timestamp}] ${message}`;
    logBuffer.push(logEntry);
    if (logBuffer.length > MAX_LOGS) logBuffer.shift();
}

// Expose addToLogs globally for bot integration
global.dashboardLogger = {
    log: (msg) => addToLogs(`[BOT] ${msg}`),
    error: (msg) => addToLogs(`[BOT ERROR] ${msg}`),
    warn: (msg) => addToLogs(`[BOT WARN] ${msg}`)
};

// Add initial log
addToLogs('[SYSTEM] Server started');

app.get('/api/logs', (req, res) => {
    // No authentication required for logs - they're just system messages
    res.json(logBuffer);
});

app.get('/api/auth-status', (req, res) => {
    res.json({ enabled: isConfigured });
});

app.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

app.get('/api/guilds', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated' });

    try {
        const userGuilds = req.user.guilds || [];
        // Filter for Administrator permissions (0x8)
        const adminGuilds = userGuilds.filter(g => (g.permissions & 0x8) === 0x8);

        const botClient = global.discordClient;

        if (botClient) {
            addToLogs(`[DEBUG] Bot is in ${botClient.guilds.cache.size} servers`);
        } else {
            addToLogs(`[WARN] Bot client not available`);
        }

        const result = adminGuilds.map(g => {
            const botInGuild = botClient ? botClient.guilds.cache.has(g.id) : false;
            return {
                id: g.id,
                name: g.name,
                icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
                botInGuild: botInGuild,
                permissions: g.permissions
            };
        });

        res.json(result);
    } catch (error) {
        addToLogs(`[ERROR] Failed to fetch guilds: ${error.message}`);
        console.error('Error fetching guilds:', error);
        res.status(500).json({ error: 'Failed to fetch guilds' });
    }
});

// --- Partnership Management API ---
app.post('/api/partnership/manage', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated' });

    const { guildId, action } = req.body; // action: 'accept' | 'reject'

    // Verify user is admin of this guild
    const userGuild = req.user.guilds.find(g => g.id === guildId);
    if (!userGuild || (userGuild.permissions & 0x8) !== 0x8) {
        return res.status(403).json({ error: 'Unauthorized: You are not an admin of this server' });
    }

    try {
        const botClient = global.discordClient;
        if (!botClient) return res.status(503).json({ error: 'Bot not ready' });

        // Logic to accept/reject partnership would go here
        // For now, we just log it as the full logic requires database integration
        addToLogs(`[PARTNERSHIP] User ${req.user.username} performed ${action} on guild ${guildId}`);

        res.json({ success: true, message: `Partnership ${action}ed successfully` });
    } catch (error) {
        addToLogs(`[ERROR] Partnership management failed: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- Server Stats API ---
app.get('/api/guilds/:id/stats', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated' });

    const guildId = req.params.id;

    // Verify user is admin of this guild
    const userGuild = req.user.guilds.find(g => g.id === guildId);
    if (!userGuild || (userGuild.permissions & 0x8) !== 0x8) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const config = await GuildConfig.findOne({ guildId });

        if (!config) {
            // Return default/empty data if not configured
            return res.json({
                memberCount: 0,
                partnershipCount: 0,
                economy: { balance: 0, tier: 'bronze' },
                partnerships: []
            });
        }

        res.json({
            memberCount: config.serverProfile?.memberCount || 0,
            partnershipCount: config.economy?.tierStats?.activePartnerships || 0,
            economy: {
                balance: config.economy?.balance || 0,
                tier: config.economy?.tier || 'bronze'
            },
            // TODO: Add real partnership requests when schema supports it
            partnerships: []
        });
    } catch (error) {
        console.error('Stats fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Auth check for dashboard.html
app.get('/dashboard.html', (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/discord');
    }
    next();
});

// Serve static files AFTER auth checks and API routes
app.use(express.static(path.join(__dirname)));

// Global Error Handler
app.use((err, req, res, next) => {
    const timestamp = new Date().toLocaleString('it-IT');
    console.error(`\n${'!'.repeat(80)}`);
    console.error(`❌ [${timestamp}] ERROR DETECTED`);
    console.error(`📍 Route: ${req.method} ${req.url}`);
    console.error(`🌐 IP: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`);
    console.error(`💥 Error: ${err.message}`);
    console.error(`📚 Stack: ${err.stack}`);
    console.error(`${'!'.repeat(80)}\n`);

    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start Server
app.listen(port, () => {
    console.log(`\n${'🚀'.repeat(40)}`);
    console.log(`✅ MinfoAI Server running on http://localhost:${port}`);
    console.log(`📊 Advanced Logging: ENABLED`);
    console.log(`🔒 Discord OAuth: ${isConfigured ? 'ENABLED' : 'DISABLED'}`);
    console.log(`${'🚀'.repeat(40)}\n`);
});
