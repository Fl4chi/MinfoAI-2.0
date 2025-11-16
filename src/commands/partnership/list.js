const { SlashCommandBuilder } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const errorLogger = require('../../utils/errorLogger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnership-list')
    .setDescription('📊 Mostra tutte le partnership attive'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const partnerships = await Partnership.find({ status: 'active' }).catch(err => {
        errorLogger.logError('ERROR', 'DB find failed', 'DB_ERROR', err);
        throw err;
      });

      if (partnerships.length === 0) {
        errorLogger.logInfo('INFO', 'No partnerships found', 'NO_PARTNERSHIPS');
        const embed = CustomEmbedBuilder.info('📊 Partnership Attive', 'Nessuna partnership attiva al momento.');
        return interaction.editReply({ embeds: [embed] });
      }

      errorLogger.logInfo('INFO', `Listing ${partnerships.length} partnerships`, 'LISTED');

      const list = partnerships.map((p, i) => 
        `**${i+1}.** ${p.primaryGuild.serverName} (${p.primaryGuild.guildId})`
      ).join('\n');

      const embed = CustomEmbedBuilder.info('📊 Partnership Attive',
        `**Totale:** ${partnerships.length}\n\n${list}`);

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      errorLogger.logError('ERROR', 'List failed', 'FAILED', error);
      const embed = CustomEmbedBuilder.error('📊 Errore', 'Errore nell\'elenco');
      try {
        await interaction.editReply({ embeds: [embed] });
      } catch (e) {
        errorLogger.logError('ERROR', 'Reply error', 'REPLY_ERROR', e);
      }
    }
  }
};
