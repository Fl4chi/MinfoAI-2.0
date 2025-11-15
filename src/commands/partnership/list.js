const { SlashCommandBuilder } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnership-list')
    .setDescription('Mostra tutte le partnership attive'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const partnerships = await Partnership.find({ status: 'active' });

      if (partnerships.length === 0) {
        return interaction.editReply({ content: '📊 Nessuna partnership attiva al momento.'});
      }

      const embed = CustomEmbedBuilder.info(
        '🤝 Partnership Attive',
        `Totale: **${partnerships.length}** partnership`
      );

      partnerships.forEach((p, i) => {
        embed.addFields({
          name: `${i + 1}. ${p.primaryGuild.guildName}`,
          value: `ID: \`${p.partnershipId}\`\nTier: ${p.tier}\nMembers: ${p.primaryGuild.memberCount}`,
          inline: true
        });
      });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error listing partnerships:', error);
      await interaction.editReply({ content: '❌ Errore nel recupero delle partnership.' });
    }
  }
};
