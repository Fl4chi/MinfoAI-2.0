const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const errorLogger = require('../../utils/errorLogger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnership-approve')
    .setDescription('✅ Approva una richiesta di partnership')
    .addStringOption(option =>
      option.setName('partnership-id')
        .setDescription('ID della partnership da approvare')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const partnershipId = interaction.options.getString('partnership-id');

    try {
      const partnership = await Partnership.findOne({ id: partnershipId, status: 'pending' });

      if (!partnership) {
        errorLogger.logWarn('WARNING', `Partnership not found or not pending: ${partnershipId}`, 'PARTNERSHIP_NOT_FOUND');
        const embed = CustomEmbedBuilder.error('❌ Errore', 'Partnership non trovata o già approvata/rifiutata.');
        return interaction.editReply({ embeds: [embed] });
      }

      partnership.status = 'active';
      partnership.approvedBy = interaction.user.id;
      await partnership.save();
      errorLogger.logInfo('INFO', `Partnership approved: ${partnershipId}`, 'PARTNERSHIP_APPROVED');

      const embed = CustomEmbedBuilder.success('✅ Partnership Approvata',
        `La partnership per **${partnership.primaryGuild.serverName}** è stata approvata con successo.`);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      errorLogger.logError('ERROR', 'Error approving partnership', 'PARTNERSHIP_APPROVAL_FAILED', error);
      const embed = CustomEmbedBuilder.error('❌ Errore', 'Errore durante l\'approvazione della partnership.');
      await interaction.editReply({ embeds: [embed] });
    }
  }
};
