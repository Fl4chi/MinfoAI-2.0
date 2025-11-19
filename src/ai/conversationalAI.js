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
                ```javascript
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
         * Costruisce il prompt per Ollama (professionale e preciso)
         */
    buildPrompt(question, context, category, language) {
        const langName = language === 'it' ? 'italiano' : language === 'en' ? 'English' : language === 'es' ? 'español' : 'français';
        
        let prompt = `You are MinfoAI Assistant, a professional AI expert for Discord partnership management.Respond in ${ langName } with ACCURATE, PROFESSIONAL, and CONFIDENT answers(max 280 characters).\n\n`;

        // Contesto bot MinfoAI
        prompt += `BOT INFO: \n`;
        prompt += `- Name: MinfoAI 2.0\n`;
        prompt += `- Purpose: Discord partnership management with AI\n`;
        prompt += `- Key features: Partnership system, AI analysis, tier system, trust scores\n`;
        prompt += `- Commands: /setup, /partnership - request, /partnership-approve, /partnership - reject, /ai-help\n\n`;

                // Contesto server
                if (context.guildName) {
                    prompt += `SERVER: ${context.guildName}\n`;
                    prompt += `Active partnerships: ${context.activePartnerships || 0}\n`;
                }

                // Contesto utente
                if (context.username) {
                    prompt += `USER: ${context.username}\n`;
                    prompt += `Trust Score: ${context.trustScore || 50}/100\n`;
                }

                // Knowledge base specifica
                const knowledge = this.knowledgeBase[category];
                if (knowledge) {
                    prompt += `\nRELEVANT INFO:\n${knowledge}\n`;
                }

                prompt += `\nQUESTION: ${question}\n\n`;
                prompt += `INSTRUCTIONS:\n`;
                prompt += `- Respond in ${langName} ONLY\n`;
                prompt += `- Be PROFESSIONAL, CLEAR, and CONFIDENT\n`;
                prompt += `- Provide ACCURATE information about MinfoAI bot\n`;
                prompt += `- Focus on partnerships and server growth\n`;
                prompt += `- Suggest specific commands when relevant\n`;
                prompt += `- Max 280 characters\n\n`;
                prompt += `PROFESSIONAL RESPONSE:`;

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
                            temperature: 0.5, // Più basso = risposte più precise e sicure
                            num_predict: 180
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
                    .replace(/^PROFESSIONAL RESPONSE:\s*/i, '')
                    .replace(/\n{3,}/g, '\n\n')
                    .substring(0, 280);

                return `🤖 ${cleaned}`;
            }

            /**
             * Risposta fallback se Ollama non è disponibile (risposte professionali)
             */
            getFallbackResponse(question, context, category, language) {
                const responses = {
                    it: {
                        partnership_approval: `📋 **Criteri di Approvazione Partnership:**\n• Server attivo: minimo 500 membri\n• Descrizione chiara e professionale\n• Link invito permanente e valido\n• Trust score ≥ 40/100\n\nUsa \`/partnership-request\` per iniziare!`,

                        tier_system: `⭐ **Sistema Tier MinfoAI:**\n🥉 Bronze: Base (0% bonus)\n🥈 Silver: +10% XP, badge esclusivo\n🥇 Gold: +25% XP, ruolo speciale\n💎 Platinum: +50% XP, massimi vantaggi\n\nGestisci con \`/partner-tier\``,

                        server_improvement: `💡 **Crescita Server per Partnership:**\n• Organizza eventi regolari e coinvolgenti\n• Crea partnership strategiche di qualità\n• Mantieni community attiva e moderata\n• Produce contenuti originali e di valore\n• Usa MinfoAI per analisi AI e matching\n\nLe partnership sono la chiave per espanderti!`,

                        troubleshooting: `🔧 **Risoluzione Problemi MinfoAI:**\n• Configura il bot: \`/setup\`\n• Verifica permessi (Administrator)\n• Controlla log nel canale configurato\n• Assicurati MongoDB sia connesso\n\nPersiste? Contatta staff con \`/partnership-report\``,

                        bot_info: `🤖 **MinfoAI 2.0 - Partnership Manager**\n\nSono un bot avanzato per gestire partnership Discord con AI integrata (LLaMA 2).\n\n**Funzionalità principali:**\n• Sistema partnership completo\n• Analisi AI e matching automatico\n• Tier system (Bronze→Platinum)\n• Trust score e analytics\n• 16 comandi specializzati\n\nUsa \`/ai-help\` per domande specifiche!`,

                        general: `🤖 **MinfoAI Assistant**\n\nPosso aiutarti con:\n✅ Consigli partnership professionali\n✅ Strategieotto\n✅ Spiegazione comandi bot\n✅ Risoluzione problemi tecnici\n\nFai una domanda specifica sul bot o le partnership!`
                    },
                    en: {
                        server_improvement: `💡 To grow your server:\n• Host regular events\n• Quality partnerships\n• Active community\n• Original content\n• Effective moderation\n\nFocus on partnerships to expand!`,
                        bot_info: `🤖 **MinfoAI 2.0 - Partnership Manager**\n\nAdvanced Discord partnership bot with integrated AI (LLaMA 2).\n\n**Key features:**\n• Complete partnership system\n• AI analysis & matching\n• Tier system (Bronze→Platinum)\n• Trust scores & analytics\n\nUse \`/ai-help\` for specific questions!`,
                        general: `🤖 I can help with:\n✅ Professional partnership advice\n✅ Server growth strategies\n✅ Bot commands explanation\n✅ Technical troubleshooting\n\nAsk me something specific!`
                    }
                };

                const langResponses = responses[language] || responses.it;

                // Se chiede del bot, usa bot_info
                if (question.toLowerCase().includes('minfoai') || question.toLowerCase().includes('questo bot') ||
                    question.toLowerCase().includes('cosa fa') || question.toLowerCase().includes('what do')) {
                    return langResponses.bot_info || langResponses.general;
                }

                return langResponses[category] || langResponses.general;
            }

            /**
             * Fallback per errori critici
             */
            getErrorFallback(language) {
                const errors = {
                    it: `🤖 Problema tecnico temporaneo. Riprova tra qualche secondo.\n\nNel frattempo:\n• Usa \`/partnership-list\` per info partnership\n• Consulta la documentazione con \`/setup\``,
                    en: `🤖 Temporary technical issue. Try again in a few seconds.\n\nMeanwhile:\n• Use \`/partnership-list\` for partnership info\n• Check documentation with \`/setup\``
                };
                return errors[language] || errors.it;
            }

            /**
             * Knowledge Base completa e professionale
             */
            buildKnowledgeBase() {
                return {
                    partnership_approval: `MinfoAI approval system: requires 500+ members, clear professional description, permanent valid invite link, trust score ≥40. Process: /partnership-request → Staff review → /partnership-approve or /partnership-reject. AI assists with credibility analysis.`,

                    tier_system: `4-tier system: Bronze (base, 0% bonus), Silver (10% XP bonus + badge), Gold (25% XP + special role), Platinum (50% XP + all perks). Tier determines partnership benefits and visibility. Managed with /partner-tier command.`,

                    server_improvement: `Server growth strategies: regular events, quality partnerships via MinfoAI, active moderation, original content, community engagement. Partnership-focused growth: use /partner-match for AI recommendations, maintain high trust score, participate in cross-server events.`,

                    troubleshooting: `Common issues: missing permissions (need Administrator), incomplete /setup configuration, MongoDB connection errors, rate limiting (30s cooldown). Solutions: verify bot permissions, check log channel, ensure proper configuration.`,

                    trust_score: `Trust score 0-100: starts at 50, increases with successful partnerships (+10 per completion), decreases with violations (-10 to -20). Minimum 40 needed for partnership approval. Improves priority in matching algorithm.`,

                    statistics: `Analytics available: /partnership-stats (global metrics), /partnership-view (specific partnership details), /partnership-list (filter by status). Tracks: active partnerships, referrals, trust scores, engagement rates.`,

                    bot_info: `MinfoAI 2.0: Professional Discord partnership management bot. Features: AI-powered analysis (Ollama LLaMA 2), automated matching, tier system, trust scores, 16 specialized commands. Database: MongoDB. Setup: /setup command configures partnership channel, staff role, log channel.`
                };
            }
        }

        module.exports = new ConversationalAI();
        ```
