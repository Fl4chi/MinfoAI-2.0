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

    async askQuestion(question, context = {}) {
        try {
            const language = this.detectLanguage(question);
            const category = this.categorizeQuestion(question);
            const prompt = this.buildPrompt(question, context, category, language);

            if (ollamaAI.isConnected) {
                const response = await this.getOllamaResponse(prompt);
                return this.formatResponse(response, language);
            }

            return this.getFallbackResponse(question, context, category, language);
        } catch (error) {
            errorLogger.logError('ERROR', 'Errore conversational AI', 'CONV_AI_ERROR', error);
            return this.getErrorFallback(language || 'it');
        }
    }

    detectLanguage(text) {
        const t = text.toLowerCase();

        // Italiano - PRIORIT√Ä massima
        if (/\b(come|cosa|perch[eé]|quando|dove|chi|quale|ciao|grazie|aiuto|puoi|posso|fare|funziona|questo)\b/.test(t)) {
            return 'it';
        }
        if (/\b(how|what|why|when|where|who|which|hello|thanks|help|can)\b/.test(t) &&
            !/\b(cosa|come|perché)\b/.test(t)) {
            return 'en';
        }

        return 'it'; // SEMPRE italiano di default
    }

    categorizeQuestion(question) {
        const q = question.toLowerCase();

        if (q.includes('minfoai') || q.includes('bot') || q.includes('cosa fa')) return 'bot_info';
        if (q.includes('approv') || q.includes('rifiut')) return 'partnership_approval';
        if (q.includes('tier')) return 'tier_system';
        if (q.includes('errore') || q.includes('problema')) return 'troubleshooting';
        if (q.includes('miglior') || q.includes('cresce')) return 'server_improvement';
        if (q.includes('trust') || q.includes('score')) return 'trust_score';

        return 'general';
    }

    buildPrompt(question, context, category, language) {
        const langName = language === 'it' ? 'italiano' : 'English';

        let prompt = `You are MinfoAI Assistant. Respond in ${langName} ONLY. Be PROFESSIONAL and CONFIDENT (max 260 chars).\n\n`;
        prompt += `BOT: MinfoAI 2.0 - Discord partnership manager with AI (LLaMA 2)\n`;
        prompt += `Commands: /setup, /partnership-request, /partnership-approve, /ai-help\n\n`;

        if (context.guildName) {
            prompt += `SERVER: ${context.guildName}\n`;
        }

        const knowledge = this.knowledgeBase[category];
        if (knowledge) {
            prompt += `\nINFO: ${knowledge}\n`;
        }

        prompt += `\nQUESTION: ${question}\n\n`;
        prompt += `Respond PROFESSIONALLY in ${langName}, max 260 chars.\nRESPONSE:`;

        return prompt;
    }

    async getOllamaResponse(prompt) {
        const response = await fetch(`${ollamaAI.ollamaHost}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama2',
                prompt: prompt,
                stream: false,
                temperature: 0.4,
                num_predict: 160
            })
        });

        if (!response.ok) throw new Error('Ollama error');
        const data = await response.json();
        return data.response;
    }

    formatResponse(response, language) {
        let cleaned = response
            .trim()
            .replace(/^(RISPOSTA|RESPONSE|PROFESSIONAL RESPONSE):\s*/i, '')
            .substring(0, 260);

        return `🤖 ${cleaned}`;
    }

    getFallbackResponse(question, context, category, language) {
        const responses = {
            it: {
                bot_info: `🤖 **MinfoAI 2.0** - Bot professionale per partnership Discord.\n\n✅ Sistema partnership completo\n✅ Analisi AI (LLaMA 2)\n✅ Tier Bronze→Platinum\n✅ Trust score e analytics\n✅ 16 comandi specializzati\n\nUsa /setup per iniziare!`,

                partnership_approval: `📋 **Criteri Approvazione:**\n• Server 500+ membri\n• Descrizione professionale\n• Link invito valido\n• Trust score ≥40\n\nComando: /partnership-request`,

                server_improvement: `💡 **Crescita Server:**\n• Eventi regolari\n• Partnership qualità (usa MinfoAI!)\n• Community attiva\n• Contenuti originali\n\nLe partnership sono la chiave!`,

                general: `🤖 Ciao! Posso aiutarti con:\n✅ Partnership professionali\n✅ Crescita server\n✅ Comandi bot\n✅ Risoluzione problemi\n\nFai una domanda specifica!`
            }
        };

        const langResponses = responses[language] || responses.it;

        if (question.toLowerCase().includes('minfoai') || question.toLowerCase().includes('bot') || question.toLowerCase().includes('cosa fa')) {
            return langResponses.bot_info;
        }

        return langResponses[category] || langResponses.general;
    }

    getErrorFallback(language) {
        return language === 'it'
            ? `🤖 Problema temporaneo. Riprova tra qualche secondo o usa /partnership-list per info.`
            : `🤖 Temporary issue. Try again or use /partnership-list.`;
    }

    buildKnowledgeBase() {
        return {
            bot_info: `MinfoAI 2.0: Professional partnership manager. AI-powered (Ollama LLaMA 2), tier system, trust scores, 16 commands. Setup: /setup`,
            partnership_approval: `Requirements: 500+ members, professional description, valid invite, trust score ≥40. Command: /partnership-request`,
            tier_system: `4 tiers: Bronze (0%), Silver (10%), Gold (25%), Platinum (50%). Command: /partner-tier`,
            server_improvement: `Growth: events, quality partnerships, active moderation, original content. Use /partner-match for AI recommendations`,
            troubleshooting: `Common: missing perms (need Admin), incomplete /setup, MongoDB errors, rate limit (30s). Check /setup`,
            trust_score: `Score 0-100 (start 50). +10 per partnership, -10 violations. Min 40 for approval`,
            general: `MinfoAI: Discord partnership bot with AI. Commands: /setup, /partnership-request, /ai-help`
        };
    }
}

module.exports = new ConversationalAI();
