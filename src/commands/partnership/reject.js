const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const errorLogger = require('../../utils/errorLogger');

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

    const partnershipId = interaction.options.getString('partnership-id');
    const reason = interaction.options.getString('reason') || 'Nessun motivo specificato';

    try {
      const partnership = await Partnership.findOne({ id: partnershipId, status: 'pending' });

      if (!partnership) {
        errorLogger.logWarn('WARNING', `Partnership not found or not pending: ${partnershipId}`, 'PARTNERSHIP_NOT_FOUND');
        const embed = CustomEmbedBuilder.error('❌ Errore', 'Partnership non trovata o già approvata/rifiutata.');
        return interaction.editReply({ embeds: [embed] });
      }

      partnership.status = 'rejected';
      partnership.rejectionReason = reason;
      partnership.rejectedBy = interaction.user.id;
      await partnership.save();
      errorLogger.logInfo('INFO', `Partnership rejected: ${partnershipId}`, 'PARTNERSHIP_REJECTED');

      const embed = CustomEmbedBuilder.success('✅ Partnership Rifiutata',
        `La partnership per **${partnership.primaryGuild.serverName}** è stata rifiutata.\n\n**Motivo:** ${reason}`);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      errorLogger.logError('ERROR', 'Error rejecting partnership', 'PARTNERSHIP_REJECTION_FAILED', error);
      const embed = CustomEmbedBuilder.error('❌ Errore', 'Errore durante il rifiuto della partnership.');
      await interaction.editReply({ embeds: [embed] });
    }
  }
};
