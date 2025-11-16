const { SlashCommandBuilder } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const errorLogger = require('../../utils/errorLogger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnership-view')
    .setDescription('🔍 Visualizza dettagli di una partnership')
    .addStringOption(option =>
      option.setName('partnership-id')
        .setDescription('ID della partnership')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();

    const partnershipId = interaction.options.getString('partnership-id');

    try {
      const partnership = await Partnership.findOne({ id: partnershipId });

      if (!partnership) {
        errorLogger.logWarn('WARNING', `Partnership not found: ${partnershipId}`, 'PARTNERSHIP_NOT_FOUND');
        return interaction.editReply({ content: '❌ Partnership non trovata' });
      }

      const embed = CustomEmbedBuilder.info(
        `🔍 Partnership: ${partnership.primaryGuild.guildName}`,
        `**Status:** ${partnership.status}\n**Tier:** ${partnership.tier || 'Standard'}\n**ID:** \`${partnership.id}\``
      )
        .addFields(
          { name: 'Server', value: partnership.primaryGuild.guildName, inline: true },
          { name: 'Members', value: partnership.primaryGuild.memberCount?.toString() || 'N/A', inline: true },
        );

      errorLogger.logInfo('INFO', `Partnership viewed: ${partnershipId}`, 'PARTNERSHIP_VIEWED');
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      errorLogger.logError('ERROR', 'Error viewing partnership', 'PARTNERSHIP_VIEW_FAILED', error);
      const embed = CustomEmbedBuilder.error('❌ Errore', 'Errore nel recupero dei dettagli della partnership.');
      await interaction.editReply({ embeds: [embed] });
    }
  }
};
