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
    try {
      const partnershipId = interaction.options.getString('partnership-id');

      const partnership = await Partnership.findOneAndDelete({ partnershipId: partnershipId }).catch(err => {
        errorLogger.logError('ERROR', 'DB delete failed', 'DB_ERROR', err);
        throw err;
      });

      if (!partnership) {
        errorLogger.logWarn('WARNING', `Partnership not found: ${partnershipId}`, 'NOT_FOUND');
        const embed = CustomEmbedBuilder.error('🗑️ Non Trovata', 'Partnership non trovata');
        return interaction.editReply({ embeds: [embed] });
      }

      errorLogger.logInfo('INFO', `Partnership deleted: ${partnershipId}`, 'DELETED');

      const embed = CustomEmbedBuilder.success('🗑️ Eliminata',
        `Partnership \`${partnershipId}\` eliminata con successo.`);

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      errorLogger.logError('ERROR', 'Delete failed', 'FAILED', error);
      const embed = CustomEmbedBuilder.error('🗑️ Errore', 'Errore nell\'eliminazione');
      try {
        await interaction.editReply({ embeds: [embed] });
      } catch (e) {
        errorLogger.logError('ERROR', 'Reply error', 'REPLY_ERROR', e);
      }
    }
  }
};
