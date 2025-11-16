const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const errorLogger = require('../../utils/errorLogger');
const ollamaAI = require('../../ai/ollamaAI');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnership-report')
    .setDescription('📈 Genera report completo delle partnership')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const partnerships = await Partnership.find().catch(err => {
        errorLogger.logError('ERROR', 'DB find failed', 'DB_ERROR', err);
        throw err;
      });

      if (partnerships.length === 0) {
        const embed = CustomEmbedBuilder.error('❌ Nessuna Partnership', 'Nessuna partnership trovata');
        return interaction.editReply({ embeds: [embed] });
      }

      const active = partnerships.filter(p => p.status === 'active').length;
      const pending = partnerships.filter(p => p.status === 'pending').length;
      const rejected = partnerships.filter(p => p.status === 'rejected').length;
      const avgTrustScore = partnerships.reduce((sum, p) => sum + (p.aiAnalysis?.credibilityScore || 50), 0) / partnerships.length;

      const aiAnalysis = await ollamaAI.generatePartnershipRecommendationReason(
        { username: 'report', guildCount: partnerships.length, coins: 0 },
        { name: 'Report', memberCount: active, category: 'analytics' }
      ).catch(() => 'Report generato');

      errorLogger.logInfo('INFO', `Report generated for ${partnerships.length} partnerships`, 'REPORT_GENERATED');

      const embed = CustomEmbedBuilder.info('📈 Partnership Report',
        `**Totale:** ${partnerships.length}\n` +
        `**Attive:** ${active}\n` +
        `**In Attesa:** ${pending}\n` +
        `**Rifiutate:** ${rejected}\n` +
        `**Media Affidabilità:** ${avgTrustScore.toFixed(1)}%\n` +
        `**AI Analysis:** ${aiAnalysis}`);

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      errorLogger.logError('ERROR', 'Report failed', 'FAILED', error);
      const embed = CustomEmbedBuilder.error('❌ Errore', 'Errore nel report');
      try {
        await interaction.editReply({ embeds: [embed] });
      } catch (e) {
        errorLogger.logError('ERROR', 'Reply error', 'REPLY_ERROR', e);
      }
    }
  }
};
