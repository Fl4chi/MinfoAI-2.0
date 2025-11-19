const { SlashCommandBuilder } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const errorLogger = require('../../utils/errorLogger');
const ollamaAI = require('../../ai/ollamaAI');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnership-view')
    .setDescription('🔍 Visualizza dettagli di una partnership')
    .addStringOption(option =>
      option.setName('partnership-id')
        .setDescription('ID della partnership')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const partnershipId = interaction.options.getString('partnership-id');

      const partnership = await Partnership.findOne({ partnershipId: partnershipId }).catch(err => {
        errorLogger.logError('ERROR', 'DB find failed', 'DB_ERROR', err);
        throw err;
      });

      if (!partnership) {
        errorLogger.logWarn('WARNING', `Partnership not found: ${partnershipId}`, 'NOT_FOUND');
        const embed = CustomEmbedBuilder.error('🔍 Non Trovata', 'Partnership non trovata');
        return interaction.editReply({ embeds: [embed] });
      }

      errorLogger.logInfo('INFO', `Viewing partnership: ${partnershipId}`, 'VIEWED');

      const embed = CustomEmbedBuilder.info(`🔍 Partnership ${partnership.partnershipId}`,
        `**Server:** ${partnership.primaryGuild.serverName}\n` +
        `**Status:** ${partnership.status}\n` +
        `**Creata:** ${partnership.createdAt.toLocaleDateString('it-IT')}\n` +
        `**Descrizione:** ${partnership.primaryGuild.description}\n` +
        `**AI Analysis:** ${partnership.aiAnalysis?.userProfile || 'N/A'}`);

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      errorLogger.logError('ERROR', 'View failed', 'FAILED', error);
      const embed = CustomEmbedBuilder.error('🔍 Errore', 'Errore nella visualizzazione');
      try {
        await interaction.editReply({ embeds: [embed] });
      } catch (e) {
        errorLogger.logError('ERROR', 'Reply error', 'REPLY_ERROR', e);
      }
    }
  }
};
