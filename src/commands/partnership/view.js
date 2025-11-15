const { SlashCommandBuilder } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnership-view')
    .setDescription('Visualizza dettagli di una partnership')
    .addStringOption(option =>
      option.setName('partnership-id')
        .setDescription('ID della partnership')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();

    const partnershipId = interaction.options.getString('partnership-id');

    try {
      const partnership = await Partnership.findOne({ partnershipId });

      if (!partnership) {
        return interaction.editReply({ content: '❌ Partnership non trovata!' });
      }

      const embed = CustomEmbedBuilder.info(
        `🔍 Partnership: ${partnership.primaryGuild.guildName}`,
        `**Status:** ${partnership.status}\n**Tier:** ${partnership.tier}\n**ID:** \`${partnership.partnershipId}\``
      )
        .addFields(
          { name: 'Server', value: partnership.primaryGuild.guildName, inline: true },
          { name: 'Members', value: partnership.primaryGuild.memberCount.toString(), inline: true },
          { name: 'Creata', value: partnership.createdAt.toLocaleDateString(), inline: true }
        );

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error viewing partnership:', error);
      await interaction.editReply({ content: '❌ Errore nel recupero dei dettagli.' });
    }
  }
};
