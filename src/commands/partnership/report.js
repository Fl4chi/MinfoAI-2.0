const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const errorLogger = require('../../utils/errorLogger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnership-report')
    .setDescription('📓 Genera un report dettagliato delle partnership')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const allPartnerships = await Partnership.find().sort({ createdAt: -1 });

      if (allPartnerships.length === 0) {
        errorLogger.logWarn('WARNING', 'No partnerships found for report', 'NO_PARTNERSHIPS');
        return interaction.editReply({ content: '📛 Nessuna partnership trovata per generare il report.' });
      }

      // Statistics
      const totalActive = allPartnerships.filter(p => p.status === 'active').length;
      const totalPending = allPartnerships.filter(p => p.status === 'pending').length;
      const totalRejected = allPartnerships.filter(p => p.status === 'rejected').length;

      // Calculate average trust score
      const avgTrustScore = allPartnerships.reduce((sum, p) => sum + (p.trustScore || 50), 0) / allPartnerships.length;

      const embed = CustomEmbedBuilder.info(
        '📓 Report Partnership Completo',
        `Generato il ${new Date().toLocaleDateString('it-IT')}`
      )
        .addFields(
          { name: 'Total', value: allPartnerships.length.toString(), inline: true },
          { name: 'Attive', value: totalActive.toString(), inline: true },
          { name: 'In Attesa', value: totalPending.toString(), inline: true },
          { name: 'Rifiutate', value: totalRejected.toString(), inline: true },
          { name: 'Trust Score Medio', value: avgTrustScore.toFixed(2), inline: true }
        )
        .setTimestamp();

      errorLogger.logInfo('INFO', `Report generated - Total partnerships: ${allPartnerships.length}`, 'REPORT_GENERATED');
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      errorLogger.logError('ERROR', 'Error generating partnership report', 'REPORT_GENERATION_FAILED', error);
      const embed = CustomEmbedBuilder.error('❌ Errore', 'Errore nella generazione del report.');
      await interaction.editReply({ embeds: [embed] });
    }
  }
};
