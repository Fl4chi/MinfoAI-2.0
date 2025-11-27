// MinfoAI Website - Backend API Endpoint for Chat
// Uses existing GEMINI_API_KEY from .env

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.CHAT_API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini with existing API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const prompt = `Sei l'assistente AI di MinfoAI, un bot Discord per gestire partnership.

CONTESTO:
- MinfoAI offre sistema di partnership automatizzato con AI
- Credibility Score da 0-100 (algoritmo proprietario)
- Economy con MinfoCoins (daily quests, premium shop)
- Tier system: Bronze (gratis), Silver (1000c), Gold (2500c), Platinum (5000c)
- Features: Analisi intelligente, automazione completa, fraud detection
- AI powered by Gemini 2.0 Flash

Rispondi in italiano, sii conciso (max 3-4 righe), professionale e utile.

DOMANDA UTENTE: ${message}

RISPOSTA:`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        console.log(`[Chat] User: ${message.substring(0, 50)}... | Response: ${response.substring(0, 50)}...`);

        res.json({ response });

    } catch (error) {
        console.error('[Chat Error]', error);
        res.status(500).json({
            error: 'Errore nel processare la richiesta',
            details: error.message
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'MinfoAI Chat API',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`✅ MinfoAI Chat API running on http://localhost:${PORT}`);
    console.log(`📡 Using GEMINI_API_KEY from .env`);
});

module.exports = app;
