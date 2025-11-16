const { SlashCommandBuilder } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const errorLogger = require('../../utils/errorLogger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnership-stats')
    .setDescription('📊 Statistiche partnership'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const total = await Partnership.countDocuments();
      const active = await Partnership.countDocuments({ status: 'active' });
      const pending = await Partnership.countDocuments({ status: 'pending' });
      const rejected = await Partnership.countDocuments({ status: 'rejected' });

      errorLogger.logInfo('INFO', `Stats generated`, 'STATS');

      const embed = CustomEmbedBuilder.info('📊 Statistics',
        `**Totale:** ${total}\n` +
        `**Attive:** ${active} (${((active/total)*100).toFixed(1)}%)\n` +
        `**In Attesa:** ${pending} (${((pending/total)*100).toFixed(1)}%)\n` +
        `**Rifiutate:** ${rejected} (${((rejected/total)*100).toFixed(1)}%)`);

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      errorLogger.logError('ERROR', 'Stats failed', 'FAILED', error);
      const embed = CustomEmbedBuilder.error('📊 Errore', 'Errore nelle statistiche');
      try {
        await interaction.editReply({ embeds: [embed] });
      } catch (e) {
        errorLogger.logError('ERROR', 'Reply error', 'REPLY_ERROR', e);
      }
    }
  }
};
