const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const errorLogger = require('../../utils/errorLogger');
const ollamaAI = require('../../ai/ollamaAI');
const userProfiler = require('../../ai/userProfiler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnership-approve')
    .setDescription('✅ Approva una richiesta di partnership')
    .addStringOption(option =>
      option.setName('partnership-id')
        .setDescription('ID della partnership da approvare')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const partnershipId = interaction.options.getString('partnership-id');

      const partnership = await Partnership.findOne({ id: partnershipId, status: 'pending' }).catch(err => {
        errorLogger.logError('ERROR', 'DB find failed', 'DB_FIND_ERROR', err);
        throw err;
      });

      if (!partnership) {
        errorLogger.logWarn('WARNING', `Partnership not found: ${partnershipId}`, 'NOT_FOUND');
        const embed = CustomEmbedBuilder.error('❌ Non Trovata', 'Partnership non trovata o già elaborata');
        return interaction.editReply({ embeds: [embed] });
      }

      // AI: Analizza partnership per approval insight
      const userProfile = await userProfiler.buildUserProfile(
        await interaction.guild.members.fetch(partnership.primaryGuild.userId),
        interaction.guild
      ).catch(() => null);
      const aiAnalysis = userProfile ? await ollamaAI.analyzeUserProfile(userProfile) : 'Profilo non disponibile';

      // Update partnership
      partnership.status = 'active';
      partnership.approvedBy = interaction.user.id;
      partnership.approvedAt = new Date();
      partnership.aiApprovalAnalysis = {
        analysis: aiAnalysis,
        timestamp: new Date()
      };

      await partnership.save().catch(err => {
        errorLogger.logError('ERROR', 'Save failed', 'SAVE_ERROR', err);
        throw err;
      });

      errorLogger.logInfo('INFO', `Partnership approved: ${partnershipId}`, 'APPROVED');

      const embed = CustomEmbedBuilder.success('✅ Partnership Approvata',
        `**Server:** ${partnership.primaryGuild.serverName}\n` +
        `**ID:** \`${partnership.id}\`\n` +
        `**AI Analysis:** ${aiAnalysis}\n` +
        `**Status:** Attiva`);

      await interaction.editReply({ embeds: [embed] });
      errorLogger.logInfo('INFO', `Approval confirmed to ${partnership.primaryGuild.userId}`, 'CONFIRMED');

    } catch (error) {
      errorLogger.logError('ERROR', 'Approve command failed', 'FAILED', error);
      const embed = CustomEmbedBuilder.error('❌ Errore', 'Errore nell\'approvazione');
      try {
        await interaction.editReply({ embeds: [embed] });
      } catch (e) {
        errorLogger.logError('ERROR', 'Reply error', 'REPLY_ERROR', e);
      }
    }
  }
};
