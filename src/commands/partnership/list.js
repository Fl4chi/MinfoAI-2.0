const { SlashCommandBuilder } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const errorLogger = require('../../utils/errorLogger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnership-list')
    .setDescription('📑 Mostra tutte le partnership attive'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const partnerships = await Partnership.find({ status: 'active' });

      if (partnerships.length === 0) {
        errorLogger.logInfo('INFO', 'No active partnerships found', 'NO_PARTNERSHIPS');
        return interaction.editReply({ content: '📛 Nessuna partnership attiva al momento.' });
      }

      const embed = CustomEmbedBuilder.info(
        '📑 Partnership Attive',
        `Totale: **${partnerships.length}** partnership`
      );

      partnerships.forEach((p, i) => {
        embed.addFields({
          name: `${i + 1}. ${p.primaryGuild.guildName}`,
          value: `ID: \`${p.id}\`\nTier: ${p.tier || 'Standard'}\nMembers: ${p.primaryGuild.memberCount || 'N/A'}`,
          inline: true
        });
      });

      errorLogger.logInfo('INFO', `Listed ${partnerships.length} active partnerships`, 'PARTNERSHIPS_LISTED');
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      errorLogger.logError('ERROR', 'Error listing partnerships', 'PARTNERSHIP_LIST_FAILED', error);
      const embed = CustomEmbedBuilder.error('❌ Errore', 'Errore nel recupero delle partnership.');
      await interaction.editReply({ embeds: [embed] });
    }
  }
};
