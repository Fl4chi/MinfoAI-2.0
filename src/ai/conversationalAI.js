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
    categorizeQuestion(question) {
        const q = question.toLowerCase();

        if (q.includes('approv') || q.includes('accept') || q.includes('rifiut') || q.includes('reject')) {
            return 'partnership_approval';
        }
        if (q.includes('tier') || q.includes('livello') || q.includes('upgrade')) {
            return 'tier_system';
        }
        if (q.includes('error') || q.includes('errore') || q.includes('problema') || q.includes('bug')) {
            return 'troubleshooting';
        }
        if (q.includes('come') || q.includes('cosa') || q.includes('perch') || q.includes('quando')) {
            return 'how_to';
        }
        if (q.includes('trust') || q.includes('credib') || q.includes('score')) {
            return 'trust_score';
        }
        if (q.includes('statistic') || q.includes('dati') || q.includes('numeri')) {
            return 'statistics';
            const response = await fetch(`${ollamaAI.ollamaHost}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama2',
                    prompt: prompt,
                    stream: false,
                    temperature: 0.7,
                    num_predict: 250,
                    top_p: 0.9
                }),
                timeout: 10000
            });

            if (!response.ok) throw new Error('Ollama API error');

            const data = await response.json();
            return data.response;

        } catch (error) {
            partnership_approval: `📋 **Criteri di Approvazione:**\n\n1. Server attivo (500+ membri)\n2. Descrizione chiara e completa\n3. Link invito permanente valido\n4. Motivazione convincente\n5. Trust score ≥ 40\n\nUsa \`/partnership-request\` con tutti i campi!`,

            tier_system: `⭐ **Tier Partnership:**\n\n🥉 **Bronze**: Base (0% bonus)\n🥈 **Silver**: +10% XP, badge\n🥇 **Gold**: +25% XP, ruolo speciale\n💎 **Platinum**: +50% XP, tutti i vantaggi\n\nComando: \`/partner-tier\``,

            troubleshooting: `🔧 **Risoluzione Problemi:**\n\n1. Verifica configurazione: \`/setup\`\n2. Controlla permessi bot\n3. Vedi log errori nel canale configurato\n4. Riprova tra qualche minuto\n\nSe persiste, contatta lo staff!`,

            trust_score: `🛡️ **Trust Score:**\n\nIl tuo trust score: ${context.trustScore || 50}/100\n\n**Come aumentarlo:**\n• Partnership completate con successo\n• Interazioni regolari\n• F eedback positivi\n• Assenza di violazioni\n\nPiù alto = priorità approvazioni!`,

            statistics: `📊 **Statistiche:**\n\nPartnership attive: ${context.activePartnerships || 0}\nTue partnership: ${context.userPartnerships || 0}\n\nUsa \`/partnership-stats\` per dettagli completi!`,

            how_to: `💡 **Aiuto Rapido:**\n\n• \`/setup\` - Configura il bot\n• \`/partnership-request\` - Nuova partnership\n• \`/partnership-list\` - Vedi tutte le partnership\n• \`/ai-help\` - Fai domande (questo comando!)\n\nDigita \`/\` per vedere tutti i comandi!`,

            general: `🤖 Ciao! Sono l'assistente AI di MinfoAI.\n\nPosso aiutarti con:\n• Consigli su partnership\n• Spiegazioni comandi\n• Risoluzione problemi\n• Informazioni tier e trust score\n\nFai una domanda specifica per un aiuto migliore!`
        };

        return fallbacks[category] || fallbacks.general;
    }

    /**
     * Fallback per errori critici
     */
    getErrorFallback() {
        return `🤖 Mi dispiace, ho avuto un problema tecnico.\n\n💡 **Puoi:**\n• Riprovare tra qualche secondo\n• Usare \`/partnership-list\` per info partnership\n• Contattare lo staff con \`/partnership-report\`\n\nL'AI potrebbe non essere disponibile al momento.`;
    }

    /**
     * Knowledge Base per ogni categoria
     */
    buildKnowledgeBase() {
        return {
            partnership_approval: `
        Criteri approvazione: min 500 membri, descrizione chiara, link valido, trust score ≥ 40.
        Comandi: /partnership-request per richiedere, /partnership-approve per approvare.
      `,
            tier_system: `
        Tier: Bronze (base), Silver (10% bonus), Gold (25% bonus), Platinum (50% bonus).
        Comando: /partner-tier per gestire tier.
      `,
            troubleshooting: `
        Errori comuni: permessi mancanti, configurazione incompleta, rate limiting.
        Comando: /setup per configurare, verifica sempre permessi bot.
      `,
            trust_score: `
        Trust score: 0-100. Aumenta con partnership positive, diminuisce con violazioni.
        Soglia minima: 40 per approvazione partnership.
      `,
            statistics: `
        Comandi stats: /partnership-stats (globali), /partnership-view (specifiche).
        Metriche: partnership attive, referral, trust score medio.
      `,
            how_to: `
        Comandi principali: /setup, /partnership-request, /partnership-list, /partner-ai.
        Tutorial: GUIDA_USO.md nella documentazione.
      `
        };
    }

    /**
     * Suggerimento AI per errori (integrazione sistema errori)
     */
    async getSuggestionForError(errorCode, errorMessage, context = {}) {
        const errorPrompt = `Un utente ha ricevuto questo errore:\n\nCodice: ${errorCode}\nMessaggio: ${errorMessage}\n\nFornisci un suggerimento chiaro in italiano (max 200 caratteri) su come risolverlo.`;

        try {
            if (ollamaAI.isConnected) {
                const response = await this.getOllamaResponse(errorPrompt);
                return response.substring(0, 200);
            }
        } catch (error) {
            // Silently fail, use fallback
        }

        // Fallback suggestions
        const suggestions = {
            'PERMISSION_ERROR': 'Verifica che il bot abbia i permessi necessari (Admin o Staff role configurato).',
            'NOT_CONFIGURED': 'Esegui /setup per configurare il bot sul server.',
            'INVALID_ID': 'Controlla che l\'ID partnership sia corretto. Usa /partnership-list per vederli tutti.',
            'RATE_LIMIT': 'Attendi qualche secondo, stai facendo troppe richieste.',
            'DATABASE_ERROR': 'Errore database temporaneo. Riprova tra qualche minuto.',
            'AI_OFFLINE': 'L\'AI non è disponibile. Il bot funziona comunque in modalità fallback.'
        };

        return suggestions[errorCode] || 'Riprova tra qualche secondo o contatta lo staff con /partnership-report.';
    }
}

module.exports = new ConversationalAI();
