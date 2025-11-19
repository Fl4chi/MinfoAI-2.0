/**
 * Context Builder
 * Costruisce il contesto per l'AI raccogliendo dati da database e Discord
 */

const GuildConfig = require('../database/guildConfigSchema');
const Partnership = require('../database/partnershipSchema');
const errorLogger = require('./errorLogger');

class ContextBuilder {
    /**
     * Costruisce contesto completo per l'utente
     * @param {Interaction} interaction - Discord interaction
     * @param {String} contextParam - Parametro contesto opzionale (es: partnership-id)
     * @returns {Object} - Contesto strutturato
     */
    async buildUserContext(interaction, contextParam = null) {
        try {
            const context = {
                username: interaction.user.tag,
                userId: interaction.user.id,
                guildId: interaction.guildId,
                guildName: interaction.guild.name
            };

            // Recupera configurazione server
            const guildConfig = await GuildConfig.findOne({ guildId: interaction.guildId });
            if (guildConfig) {
                context.configured = guildConfig.isConfigured;
                context.staffRoleId = guildConfig.staffRoleId;
            }

            // Recupera partnership dell'utente
            const userPartnerships = await Partnership.find({
                $or: [
                    { 'primaryGuild.ownerUserId': interaction.user.id },
                    { 'secondaryGuild.ownerUserId': interaction.user.id },
                    { requestedBy: interaction.user.id }
                ]
            });

            context.userPartnerships = userPartnerships.length;
            context.activePartnerships = userPartnerships.filter(p => p.status === 'active').length;

            // Calcola trust score semplificato
            const approvedCount = userPartnerships.filter(p => p.status === 'active').length;
            const rejectedCount = userPartnerships.filter(p => p.status === 'rejected').length;
            const totalViolations = userPartnerships.reduce((sum, p) => sum + (p.totalViolations || 0), 0);

            // Formula: base 50 + approvazioni*10 - rifiuti*5 - violazioni*10
            context.trustScore = Math.max(0, Math.min(100,
                50 + (approvedCount * 10) - (rejectedCount * 5) - (totalViolations * 10)
            ));

            // Se c'è un parametro context (es: partnership-id)
            if (contextParam) {
                context.contextParam = contextParam;

                // Cerca partnership specifica
                const partnership = await Partnership.findOne({ partnershipId: contextParam });
                if (partnership) {
                    context.partnershipId = partnership.partnershipId;
                    context.partnershipStatus = partnership.status;
                    context.partnershipTier = partnership.tier;
                    context.partnershipTrustScore = partnership.trustScore;
                }
            }

            // Partnership totali nel server
            const serverPartnerships = await Partnership.countDocuments({
                $or: [
                    { 'primaryGuild.guildId': interaction.guildId },
                    { 'secondaryGuild.guildId': interaction.guildId }
                ]
            });

            context.serverPartnerships = serverPartnerships;

            return context;

        } catch (error) {
            errorLogger.logError('ERROR', 'Errore build context', 'CONTEXT_BUILD_ERROR', error);

            // Ritorna contesto minimo in caso di errore
            return {
                username: interaction.user.tag,
                userId: interaction.user.id,
                guildName: interaction.guild.name,
                trustScore: 50,
                userPartnerships: 0,
                activePartnerships: 0
            };
        }
    }

    /**
     * Costruisce contesto per errori
     * @param {String} errorCode - Codice errore
     * @param {Error} error - Oggetto errore
     * @param {Object} additionalContext - Contesto aggiuntivo
     * @returns {Object} - Contesto errore
     */
    buildErrorContext(errorCode, error, additionalContext = {}) {
        return {
            errorCode,
            errorMessage: error.message,
            errorStack: error.stack?.split('\n').slice(0, 3).join('\n'),
            timestamp: new Date(),
            ...additionalContext
        };
    }

    /**
     * Formatta contesto per il prompt AI
     * @param {Object} context - Contesto raw
     * @returns {String} - Contesto formattato
     */
    formatContextForPrompt(context) {
        let formatted = '';

        if (context.guildName) {
            formatted += `Server: ${context.guildName}\n`;
        }

        if (context.username) {
            formatted += `Utente: ${context.username}\n`;
        }

        if (context.trustScore !== undefined) {
            formatted += `Trust Score: ${context.trustScore}/100\n`;
        }

        if (context.userPartnerships !== undefined) {
            formatted += `Partnership Utente: ${context.userPartnerships} (${context.activePartnerships} attive)\n`;
        }

        if (context.partnershipId) {
            formatted += `Partnership ID: ${context.partnershipId}\n`;
            formatted += `Status: ${context.partnershipStatus}\n`;
        }

        return formatted;
    }
}

module.exports = new ContextBuilder();
