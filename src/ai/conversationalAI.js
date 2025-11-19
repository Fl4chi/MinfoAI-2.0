/**
 * Conversational AI Module - Solo risposte italiane pre-programmate
 */

const errorLogger = require('../utils/errorLogger');

class ConversationalAI {
    async askQuestion(question, context = {}) {
        try {
            const category = this.categorizeQuestion(question);
            return this.getFallbackResponse(question, context, category);
        } catch (error) {
            errorLogger.logError('ERROR', 'Errore conversational AI', 'CONV_AI_ERROR', error);
            return '🤖 Problema temporaneo. Riprova tra qualche secondo.';
        }
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

    getFallbackResponse(question, context, category) {
        const responses = {
            bot_info: `🤖 **MinfoAI 2.0** - Bot professionale per partnership Discord.\n\n✅ Sistema partnership completo\n✅ Analisi AI (LLaMA 2)\n✅ Tier Bronze→Platinum\n✅ Trust score e analytics\n✅ 16 comandi specializzati\n\nUsa /setup per iniziare!`,

            partnership_approval: `📋 **Criteri Approvazione:**\n• Server 500+ membri\n• Descrizione professionale\n• Link invito valido\n• Trust score ≥40\n\nComando: /partnership-request`,

            tier_system: `⭐ **Sistema Tier:**\n🥉 Bronze (0%)\n🥈 Silver (+10% XP)\n🥇 Gold (+25% XP)\n💎 Platinum (+50% XP)\n\nComando: /partner-tier`,

            server_improvement: `💡 **Crescita Server:**\n• Eventi regolari e coinvolgenti\n• Partnership di qualità (usa MinfoAI!)\n• Community attiva\n• Contenuti originali\n\nLe partnership sono la chiave!`,

            troubleshooting: `🔧 **Risoluzione Problemi:**\n• Configura: /setup\n• Verifica permessi (Administrator)\n• Controlla log canale configurato\n\nProblemi persistenti? Usa /partnership-report`,

            trust_score: `🛡️ **Trust Score:**\nIl tuo trust score: ${context.trustScore || 50}/100\n\n**Come aumentarlo:**\n• Partnership completate\n• Nessuna violazione\n• Attività regolare\n\nMinimo 40 per approvazione!`,

            general: `🤖 **Ciao! Sono MinfoAI Assistant.**\n\nPosso aiutarti con:\n✅ Partnership professionali\n✅ Crescita server Discord\n✅ Spiegazione comandi\n✅ Risoluzione problemi\n\nFai una domanda specifica!`
        };

        // Se chiede del bot specificamente
        if (question.toLowerCase().includes('minfoai') || question.toLowerCase().includes('cosa fa')) {
            return responses.bot_info;
        }

        return responses[category] || responses.general;
    }
}

module.exports = new ConversationalAI();
