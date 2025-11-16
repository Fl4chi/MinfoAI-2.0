const { SlashCommandBuilder } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const errorLogger = require('../../utils/errorLogger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnership-stats')
    .setDescription('📈 Mostra statistiche complete delle partnership'),

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
        '📈 Statistiche Partnership',
        'Panoramica completa del sistema partnership'
      )
        .addFields(
          { name: '📊 Totale Partnership', value: totalPartnerships.toString(), inline: true },
          { name: '👥 Attive', value: activePartnerships.toString(), inline: true },
          { name: '⏳ In Attesa', value: pendingPartnerships.toString(), inline: true },
          { name: '🛻 Rifiutate', value: rejectedPartnerships.toString(), inline: true },
          { name: '\n🌟 Tier - Bronze', value: bronzeCount.toString(), inline: true },
          { name: '🤔 Tier - Silver', value: silverCount.toString(), inline: true },
          { name: '🎯 Tier - Gold', value: goldCount.toString(), inline: true },
          { name: '👑 Tier - Platinum', value: platinumCount.toString(), inline: true }
        );

      errorLogger.logInfo('INFO', `Partnership stats retrieved - Total: ${totalPartnerships}, Active: ${activePartnerships}`, 'PARTNERSHIP_STATS_VIEWED');
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      errorLogger.logError('ERROR', 'Error retrieving partnership stats', 'PARTNERSHIP_STATS_FAILED', error);
      const embed = CustomEmbedBuilder.error('❌ Errore', 'Errore nel recupero delle statistiche.');
      await interaction.editReply({ embeds: [embed] });
    }
  }
};
