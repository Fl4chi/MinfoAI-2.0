/**
 * Conversational AI Module
 * Gestisce le conversazioni con l'utente usando Ollama LLaMA 2
 */

const ollamaAI = require('./ollamaAI');
const errorLogger = require('../utils/errorLogger');

class ConversationalAI {
    constructor() {
        this.knowledgeBase = this.buildKnowledgeBase();
    }

    /**
     * Risponde a una domanda dell'utente
     */
    async askQuestion(question, context = {}) {
        try {
            // Rileva lingua della domanda
            const language = this.detectLanguage(question);

            // Categorizza la domanda
            const category = this.categorizeQuestion(question);

            // Costruisci prompt strutturato con lingua rilevata
            const prompt = this.buildPrompt(question, context, category, language);

            // Se Ollama è disponibile, usa l'AI
            if (ollamaAI.isConnected) {
                const response = await this.getOllamaResponse(prompt);
                return this.formatResponse(response, language);
            }

            // Altrimenti usa risposte pre-programmate
            return this.getFallbackResponse(question, context, category, language);

        } catch (error) {
            errorLogger.logError('ERROR', 'Errore in conversational AI', 'CONV_AI_ERROR', error);
            return this.getErrorFallback(language || 'it');
        }
    }

    /**
     * Rileva la lingua della domanda
     */
    detectLanguage(text) {
        const t = text.toLowerCase();

        // Italiano
        if (/\b(come|cosa|perch[eé]|quando|dove|chi|quale|ciao|grazie|aiuto)\b/.test(t)) {
            return 'it';
        }
        // Inglese
        if (/\b(how|what|why|when|where|who|which|hello|thanks|help)\b/.test(t)) {
            return 'en';
        }
        // Spagnolo
        if (/\b(c[oó]mo|qu[eé]|cu[aá]ndo|d[oó]nde|hola|gracias)\b/.test(t)) {
            return 'es';
        }
        // Francese
        if (/\b(comment|quoi|pourquoi|quand|bonjour|merci)\b/.test(t)) {
            return 'fr';
        }

        return 'it'; // Default italiano
    }

    /**
     * Categorizza la domanda
     */
    categorizeQuestion(question) {
        const q = question.toLowerCase();

        if (q.includes('approv') || q.includes('rifiut') || q.includes('reject')) {
            return 'partnership_approval';
        }
        if (q.includes('tier') || q.includes('livello')) {
            return 'tier_system';
        }
        if (q.includes('error') || q.includes('errore') || q.includes('problema')) {
            return 'troubleshooting';
        }
        if (q.includes('miglior') || q.includes('cresce') || q.includes('improve') || q.includes('grow')) {
            return 'server_improvement';
        }
        if (q.includes('trust') || q.includes('credib') || q.includes('score')) {
            return 'trust_score';
        }
        if (q.includes('statistic') || q.includes('dati')) {
            return 'statistics';
        }

        return 'general';
    }

    /**
     * Costruisce il prompt per Ollama
     */
    buildPrompt(question, context, category, language) {
        const langMap = {
            'it': 'italiano',
            'en': 'English',
            'es': 'español',
            'fr': 'français'
        };
        const langName = langMap[language] || 'italiano';

        let prompt = `You are MinfoAI Assistant, a Discord partnership expert. Respond in ${langName}, clearly and concisely (max 300 characters).\n\n`;

        // Contesto server
        if (context.guildName) {
            prompt += `SERVER: ${context.guildName}\n`;
            prompt += `Active partnerships: ${context.activePartnerships || 0}\n`;
        }

        // Contesto utente
        if (context.username) {
            prompt += `\nUSER: ${context.username}\n`;
            prompt += `Trust Score: ${context.trustScore || 50}/100\n`;
        }

        // Knowledge base
        const knowledge = this.knowledgeBase[category];
        if (knowledge) {
            prompt += `\nINFO:\n${knowledge}\n`;
        }

        prompt += `\nQUESTION: ${question}\n\n`;
        prompt += `Respond in ${langName}, max 300 chars, focus on partnerships.\n\n`;
        prompt += `RESPONSE:`;

        return prompt;
    }

    /**
     * Ottiene risposta da Ollama
     */
    async getOllamaResponse(prompt) {
        try {
            const response = await fetch(`${ollamaAI.ollamaHost}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama2',
                    prompt: prompt,
                    stream: false,
                    temperature: 0.7,
                    num_predict: 200
                })
            });

            if (!response.ok) throw new Error('Ollama API error');

            const data = await response.json();
            return data.response;

        } catch (error) {
            throw error;
        }
    }

    /**
     * Formatta la risposta AI
     */
    formatResponse(response, language) {
        let cleaned = response
            .trim()
            .replace(/^RISPOSTA:\s*/i, '')
            .replace(/^RESPONSE:\s*/i, '')
            .replace(/\n{3,}/g, '\n\n')
            .substring(0, 300);

        return `🤖 ${cleaned}`;
    }

    /**
     * Risposta fallback se Ollama non è disponibile
     */
    getFallbackResponse(question, context, category, language) {
        const responses = {
            it: {
                partnership_approval: `📋 Per aumentare le probabilità di approvazione:\n• Server attivo (500+ membri)\n• Descrizione chiara\n• Link invito valido\n• Trust score ≥ 40\n\nUsa /partnership-request!`,
                tier_system: `⭐ Tier Partnership:\n🥉 Bronze (base)\n🥈 Silver (+10% XP)\n🥇 Gold (+25% XP)\n💎 Platinum (+50% XP)\n\nUsa /partner-tier`,
                server_improvement: `💡 Per crescere il server:\n• Crea eventi regolari\n• Partnership di qualità\n• Community attiva\n• Contenuti originali\n• Moderazione efficace\n\nFocus su partnership per espanderti!`,
                troubleshooting: `🔧 Risoluzione:\n• Usa /setup per configurare\n• Controlla permessi bot\n• Verifica log errori\n\nContatta staff se persiste!`,
                general: `🤖 Ciao! Posso aiutarti con:\n• Consigli partnership\n• Miglioramento server\n• Risoluzione problemi\n\nFai una domanda specifica!`
            },
            en: {
                server_improvement: `💡 To grow your server:\n• Host regular events\n• Quality partnerships\n• Active community\n• Original content\n• Effective moderation\n\nFocus on partnerships to expand!`,
                general: `🤖 Hi! I can help with:\n• Partnership advice\n• Server improvement\n• Problem solving\n\nAsk me something specific!`
            }
        };

        const langResponses = responses[language] || responses.it;
        return langResponses[category] || langResponses.general;
    }

    /**
     * Fallback per errori critici
     */
    getErrorFallback(language) {
        const errors = {
            it: `🤖 Problema tecnico. Riprova tra qualche secondo o usa /partnership-list per info.`,
            en: `🤖 Technical issue. Try again in a few seconds or use /partnership-list for info.`
        };
        return errors[language] || errors.it;
    }

    /**
     * Knowledge Base
     */
    buildKnowledgeBase() {
        return {
            partnership_approval: `Approval criteria: 500+ members, clear description, valid link, trust score ≥ 40.`,
            tier_system: `Tiers: Bronze (base), Silver (10%), Gold (25%), Platinum (50%).`,
            server_improvement: `Server growth: events, partnerships, engagement, original content, moderation.`,
            troubleshooting: `Common issues: missing permissions, incomplete setup, rate limiting.`,
            trust_score: `Trust score 0-100. Increases with successful partnerships, decreases with violations.`,
            statistics: `Use /partnership-stats for global stats, /partnership-view for specific ones.`
        };
    }
}

module.exports = new ConversationalAI();
