const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class ConversationalAI {
    constructor() {
        this.genAI = null;
        this.model = null;
        this.cache = new Map(); // Simple in-memory cache
        this.CACHE_TTL = 3600 * 1000; // 1 hour
        this.manualContent = '';
        this.init();
    }

    init() {
        // Load Manual
        try {
            const manualPath = path.join(__dirname, 'BOT_MANUAL.md');
            if (fs.existsSync(manualPath)) {
                this.manualContent = fs.readFileSync(manualPath, 'utf8');
                console.log('[AI] Manuale caricato correttamente.');
            } else {
                console.warn('[AI] Manuale non trovato in:', manualPath);
            }
        } catch (err) {
            console.error('[AI] Errore caricamento manuale:', err);
        }

        // Init Gemini
        if (process.env.GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
            console.log('[AI] Gemini AI initialized');
        } else {
            console.warn('[AI] GEMINI_API_KEY mancante in .env. L\'AI userà solo i fallback.');
        }
    }

    async askQuestion(question, context = {}) {
        try {
            const cleanQuestion = question.trim();
            console.log(`\n[AI] Domanda: "${cleanQuestion.substring(0, 80)}"`);

            // 1. Check Cache
            const cached = this.getFromCache(cleanQuestion);
            if (cached) {
                console.log('[AI] ⚡ Risposta da cache');
                return cached;
            }

            // 2. Prova Gemini
            if (this.model) {
                try {
                    console.log(`[AI] Tentativo Gemini...`);
                    const response = await this.askGemini(cleanQuestion);
                    console.log(`[AI] Gemini response:`, response ? `"${response.substring(0, 100)}..."` : 'NULL');

                    if (response && response.length > 10) {
                        console.log(`[AI] ✅ Risposta Gemini OK (${response.length} chars)`);
                        const finalResponse = response + '\n\n-# 💬 Usa `/ai-help` per altre domande!';
                        this.saveToCache(cleanQuestion, finalResponse);
                        return finalResponse;
                    }
                } catch (err) {
                    console.error(`[AI] ❌ Gemini fallito:`, err.message);
                }
            } else {
                console.log('[AI] Gemini non configurato, salto...');
            }

            // 3. Fallback semplice
            console.log(`[AI] 🔄 Uso fallback`);
            return this.getSimpleFallback(cleanQuestion);

        } catch (error) {
            console.error(`[AI] Errore generale:`, error.message);
            return 'Scusa, ho avuto un problema tecnico. Riprova!';
        }
    }

    async askGemini(question) {
        try {
            const prompt = `Sei MinfoAI, l'assistente ufficiale del bot Discord MinfoAI 2.0.
            
            USA QUESTE INFORMAZIONI PER RISPONDERE (MANUALE):
            ${this.manualContent}
            
            CONTESTO UTENTE:
            - Rispondi in italiano.
            - Sii gentile, professionale e utile.
            - Se la risposta è nel manuale, usala.
            - Se non sai la risposta, suggerisci di contattare lo staff.
            - Mantieni la risposta sotto le 4-5 righe se possibile.
            
            DOMANDA UTENTE: ${question}
            
            RISPOSTA:`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (err) {
            throw err;
        }
    }

    getFromCache(key) {
        if (this.cache.has(key)) {
            const { value, timestamp } = this.cache.get(key);
            if (Date.now() - timestamp < this.CACHE_TTL) {
                return value;
            }
            this.cache.delete(key);
        }
        return null;
    }

    saveToCache(key, value) {
        // Limit cache size to 100 items to prevent memory leaks
        if (this.cache.size > 100) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, { value, timestamp: Date.now() });
    }

    getSimpleFallback(question) {
        const q = question.toLowerCase();

        if (q.includes('ciao') || q.includes('chi sei')) {
            return 'Ciao! Sono MinfoAI 2.0. Posso aiutarti con partnership, shop e comandi. Chiedimi pure!';
        }
        if (q.includes('tier') || q.includes('livelli')) {
            return 'Abbiamo 4 Tier: Bronze (Gratis), Silver (1000 Coins), Gold (2500 Coins) e Platinum (5000 Coins). Ognuno ha vantaggi unici!';
        }
        if (q.includes('shop') || q.includes('compra')) {
            return 'Usa `/shop` per vedere i potenziamenti disponibili. Puoi comprare Tier e Boost XP!';
        }

        return 'Non sono sicuro di aver capito. Prova a chiedere "quali sono i tier" o "come faccio partnership".';
    }
}

module.exports = new ConversationalAI();
