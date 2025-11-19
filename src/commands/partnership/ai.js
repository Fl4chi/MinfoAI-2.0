const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const PartnershipAI = require('../../database/partnershipAISchema');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const errorLogger = require('../../utils/errorLogger');
// const ollamaAI = require('../../ai/ollamaAI'); // Removed to prevent node-fetch error if not needed immediately, or fix import if needed.
const ollamaAI = require('../../ai/ollamaAI'); // Keep it but ensure ollamaAI.js is fixed.

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partner-ai')
    .setDescription('🤖 Mostra AI insights della tua partnership')
    .addStringOption(option =>
      option.setName('partnership-id')
        .setDescription('ID della partnership')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const partnershipId = interaction.options.getString('partnership-id');

      // Fetch partnership data
      const partnership = await Partnership.findOne({ partnershipId }).catch(err => {
        errorLogger.logError('ERROR', 'DB query failed', 'DB_ERROR', err);
        throw err;
      });

      if (!partnership) {
        const embed = CustomEmbedBuilder.error('❌ Partnership Non Trovata', 'Verifica l\'ID');
        return interaction.editReply({ embeds: [embed] });
      }

      // Fetch or create AI data
      let aiData = await PartnershipAI.findOne({ partnershipId });
      if (!aiData) {
        aiData = await PartnershipAI.create({ partnershipId });
      }

      // Generate AI insights
      const healthScore = aiData.health?.engagementScore || 50;
      const retentionProb = aiData.health?.retentionProbability || 50;

      // Build comprehensive embed
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🤖 AI Partnership Insights')
        .setDescription(`Analisi intelligente di **${partnership.serverName}**`)
        .addFields(
          {
            name: '📊 Partnership Health',
            value: `**Score:** ${healthScore}/100\n**Activity:** ${aiData.health?.activityRate || 50}%\n**Engagement:** ${aiData.health?.engagementScore || 50}%`,
            inline: true
          },
          {
            name: '⭐ Tier System',
            value: `**Level:** ${(aiData.tier?.level || 'bronze').toUpperCase()}\n**Next Check:** ${aiData.tier?.upgradeNextCheck?.toLocaleDateString('it-IT') || 'N/A'}`,
            inline: true
          },
          {
            name: '🎯 AI Recommendations',
            value: aiData.aiInsights?.recommendations?.slice(0, 3)?.join('\n') || 'Nessuna raccomandazione al momento',
            inline: false
          },
          {
            name: '⚠️ Risk Assessment',
            value: aiData.aiInsights?.risks?.slice(0, 2)?.join('\n') || 'Nessun rischio rilevato',
            inline: false
          },
          {
            name: '📈 Success Prediction',
            value: `${aiData.aiInsights?.predictedSuccessRate || 50}% probabilità di successo`,
            inline: true
          },
          {
            name: '🔄 Auto-Renewal Status',
            value: `**Enabled:** ${aiData.autoRenewal?.enabled ? '✅ Sì' : '❌ No'}\n**Next:** ${aiData.autoRenewal?.nextRenewalDate?.toLocaleDateString('it-IT') || 'N/A'}`,
            inline: true
          }
        )
        .setFooter({ text: 'MinfoAI AI Insights | Aggiornato regolarmente' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
      errorLogger.logInfo('INFO', `AI insights displayed for ${partnershipId}`, 'AI_INSIGHTS_SHOWN');

    } catch (error) {
      errorLogger.logError('ERROR', 'AI command failed', 'FAILED', error);
      const embed = CustomEmbedBuilder.error('❌ Errore', 'Riprova dopo');
      try {
        await interaction.editReply({ embeds: [embed] });
      } catch (e) {
        errorLogger.logError('ERROR', 'Reply error', 'REPLY_ERROR', e);
      }
    }
  }
};
