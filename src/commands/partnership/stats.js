const { SlashCommandBuilder } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnership-stats')
    .setDescription('Mostra statistiche complete delle partnership'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const totalPartnerships = await Partnership.countDocuments();
      const activePartnerships = await Partnership.countDocuments({ status: 'active' });
      const pendingPartnerships = await Partnership.countDocuments({ status: 'pending' });
      const rejectedPartnerships = await Partnership.countDocuments({ status: 'rejected' });

      // Partnership per tier
      const bronzeCount = await Partnership.countDocuments({ tier: 'bronze', status: 'active' });
      const silverCount = await Partnership.countDocuments({ tier: 'silver', status: 'active' });
      const goldCount = await Partnership.countDocuments({ tier: 'gold', status: 'active' });
      const platinumCount = await Partnership.countDocuments({ tier: 'platinum', status: 'active' });

      const embed = CustomEmbedBuilder.info(
        '📊 Statistiche Partnership',
        `Panoramica completa del sistema partnership`
      )
        .addFields(
          { name: '📊 Totale Partnership', value: totalPartnerships.toString(), inline: true },
          { name: '✅ Attive', value: activePartnerships.toString(), inline: true },
          { name: '⏳ In Attesa', value: pendingPartnerships.toString(), inline: true },
          { name: '❌ Rifiutate', value: rejectedPartnerships.toString(), inline: true },
          { name: '\u200b', value: '\u200b', inline: true },
          { name: '\u200b', value: '\u200b', inline: true },
          { name: '🥉 Bronze', value: bronzeCount.toString(), inline: true },
          { name: '🥈 Silver', value: silverCount.toString(), inline: true },
          { name: '🥇 Gold', value: goldCount.toString(), inline: true },
          { name: '💎 Platinum', value: platinumCount.toString(), inline: true }
        );

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error getting partnership stats:', error);
      await interaction.editReply({ content: '❌ Errore nel recupero delle statistiche.' });
    }
  }
};
