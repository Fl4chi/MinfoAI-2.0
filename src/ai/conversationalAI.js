/**
 * Conversational AI Module - Risposte italiane naturali e specifiche
 */

const errorLogger = require('../utils/errorLogger');

class ConversationalAI {
    async askQuestion(question, context = {}) {
        try {
            const category = this.categorizeQuestion(question);
            return this.getFallbackResponse(question, context, category);
        } catch (error) {
            errorLogger.logError('ERROR', 'Errore conversational AI', 'CONV_AI_ERROR', error);
            return 'Mi dispiace, c\'è stato un problemino tecnico. Riprova tra un attimo!';
        }
    }

    categorizeQuestion(question) {
        const q = question.toLowerCase();

        // Domande specifiche sul bot
        if (q.includes('minfoai') || q.includes('cosa fa') || q.includes('cosa puo') || q.includes('che bot')) return 'bot_info';

        // Partnership - approvazione
        if (q.includes('approv') || q.includes('accetta') || q.includes('requisiti')) return 'partnership_approval';
        if (q.includes('rifiut') || q.includes('reject')) return 'partnership_reject';

        // Partnership - gestione
        if (q.includes('creare partnership') || q.includes('fare partnership')) return 'create_partnership';
        if (q.includes('veder') && q.includes('partnership')) return 'view_partnerships';

        // Comandi
        if (q.includes('comando') || q.includes('come uso') || q.includes('come si usa')) return 'commands';
        if (q.includes('/setup') || q.includes('configurare') || q.includes('configurazione')) return 'setup_help';

        // Tier system
        if (q.includes('tier') || q.includes('livello') || q.includes('bronze') || q.includes('silver') || q.includes('gold') || q.includes('platinum')) return 'tier_system';

        // Trust score
        if (q.includes('trust') || q.includes('score') || q.includes('punteggio') || q.includes('reputazione')) return 'trust_score';

        // Crescita server
        if (q.includes('crescere') || q.includes('migliorare') || q.includes('aumentare membri') || q.includes('far crescere')) return 'server_improvement';

        // Trovare partner
    }
}

module.exports = new ConversationalAI();
