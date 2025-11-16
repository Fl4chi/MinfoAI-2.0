const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const errorLogger = require('../../utils/errorLogger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnership-delete')
    .setDescription('🗑️ Elimina una partnership')
    .addStringOption(option =>
      option.setName('partnership-id')
        .setDescription('ID della partnership da eliminare')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const partnershipId = interaction.options.getString('partnership-id');

    try {
      const partnership = await Partnership.findOneAndDelete({ id: partnershipId });

      if (!partnership) {
        errorLogger.logWarn('WARNING', `Partnership not found: ${partnershipId}`, 'PARTNERSHIP_NOT_FOUND');
        return interaction.editReply({ content: '❌ Partnership non trovata' });
      }

      const embed = CustomEmbedBuilder.success(
        '✅ Partnership Eliminata',
        `La partnership con **${partnership.primaryGuild.guildName}** è stata eliminata definitivamente.`
      );

      errorLogger.logInfo('INFO', `Partnership deleted: ${partnershipId}`, 'PARTNERSHIP_DELETED');
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      errorLogger.logError('ERROR', 'Error deleting partnership', 'PARTNERSHIP_DELETE_FAILED', error);
      const embed = CustomEmbedBuilder.error('❌ Errore', 'Errore nell\'eliminazione della partnership.');
      await interaction.editReply({ embeds: [embed] });
    }
  }
};
