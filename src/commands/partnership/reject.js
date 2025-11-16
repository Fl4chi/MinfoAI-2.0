const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const errorLogger = require('../../utils/errorLogger');
const ollamaAI = require('../../ai/ollamaAI');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnership-reject')
    .setDescription('❌ Rifiuta una richiesta di partnership')
    .addStringOption(option =>
      option.setName('partnership-id')
        .setDescription('ID della partnership da rifiutare')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Motivo del rifiuto')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const partnershipId = interaction.options.getString('partnership-id');
      const reason = interaction.options.getString('reason') || 'Motivo non specificato';

      const partnership = await Partnership.findOne({ id: partnershipId, status: 'pending' }).catch(err => {
        errorLogger.logError('ERROR', 'DB query failed', 'DB_ERROR', err);
        throw err;
      });

      if (!partnership) {
        errorLogger.logWarn('WARNING', `Partnership not found: ${partnershipId}`, 'NOT_FOUND');
        const embed = CustomEmbedBuilder.error('❌ Non Trovata', 'Partnership non trovata');
        return interaction.editReply({ embeds: [embed] });
      }

      // AI: Genera feedback intelligente per il motivo
      const aiReason = await ollamaAI.generatePartnershipRecommendationReason(
        { username: 'system', guildCount: 0, coins: 0 },
        { name: 'Feedback', memberCount: 0, category: 'rejected' }
      ).catch(() => reason);

      // Update partnership
      partnership.status = 'rejected';
      partnership.rejectedBy = interaction.user.id;
      partnership.rejectionReason = reason;
      partnership.aiRejectionFeedback = aiReason;
      partnership.rejectedAt = new Date();

      await partnership.save().catch(err => {
        errorLogger.logError('ERROR', 'Save failed', 'SAVE_ERROR', err);
        throw err;
      });

      errorLogger.logInfo('INFO', `Partnership rejected: ${partnershipId}`, 'REJECTED');

      const embed = CustomEmbedBuilder.error('❌ Partnership Rifiutata',
        `**ID:** \`${partnership.id}\`\n` +
        `**Motivo:** ${reason}\n` +
        `**AI Feedback:** ${aiReason}\n` +
        `**Status:** Rifiutata`);

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      errorLogger.logError('ERROR', 'Reject failed', 'FAILED', error);
      const embed = CustomEmbedBuilder.error('❌ Errore', 'Errore nel rifiuto');
      try {
        await interaction.editReply({ embeds: [embed] });
      } catch (e) {
        errorLogger.logError('ERROR', 'Reply error', 'REPLY_ERROR', e);
      }
    }
  }
};
