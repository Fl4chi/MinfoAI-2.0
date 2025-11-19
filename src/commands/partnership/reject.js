const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const errorLogger = require('../../utils/errorLogger');
const ollamaAI = require('../../ai/ollamaAI');
const ButtonHandler = require('../../utils/buttonHandler');

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
    // Define rejectButtons here or handle error reply without buttons if they are not created yet

    try {
      const partnershipId = interaction.options.getString('partnership-id');
      const reason = interaction.options.getString('reason') || 'Motivo non specificato';

      const partnership = await Partnership.findOne({ partnershipId: partnershipId, status: 'pending' }).catch(err => {
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
      interaction.client.advancedLogger?.partnership(`Partnership rejected: ${partnership.partnershipId}`, `Rejection buttons displayed for staff confirmation`)

      const embed = CustomEmbedBuilder.error('❌ Partnership Rifiutata',
        `**ID:** \`${partnership.partnershipId}\`\n` +
        `**Motivo:** ${reason}\n` +
        `**AI Feedback:** ${aiReason}\n` +
        `**Status:** Rifiutata`);

      // Crea i bottoni per il rifiuto/azione da parte dello staff
      const buttonHandler = new ButtonHandler(interaction.client.advancedLogger);
      const rejectButtons = buttonHandler.createPartnershipRejectButtons(partnership.partnershipId);

      await interaction.editReply({ embeds: [embed], components: [rejectButtons] });

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
