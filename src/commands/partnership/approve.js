const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const errorLogger = require('../../utils/errorLogger');
const ollamaAI = require('../../ai/ollamaAI');
const userProfiler = require('../../ai/userProfiler');
const ButtonHandler = require('../../utils/buttonHandler');

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
    // Define actionButtons here or inside try/catch but ensure it's available for error handling if needed
    // However, we can't create buttons without partnership ID usually.
    // So we'll handle error reply differently.

    try {
      const partnershipId = interaction.options.getString('partnership-id');

      const partnership = await Partnership.findOne({ partnershipId: partnershipId, status: 'pending' }).catch(err => {
        errorLogger.logError('ERROR', 'DB find failed', 'DB_FIND_ERROR', err);
        throw err;
      });

      if (!partnership) {
        errorLogger.logWarn('WARNING', `Partnership not found: ${partnershipId}`, 'NOT_FOUND');
        const embed = CustomEmbedBuilder.error('❌ Non Trovata', 'Partnership non trovata o già elaborata');
        return interaction.editReply({ embeds: [embed] });
      }

      // AI: Analizza partnership per approval insight
      let aiAnalysis = 'Profilo non disponibile';
      try {
        const member = await interaction.guild.members.fetch(partnership.primaryGuild.userId).catch(() => null);
        if (member) {
          const userProfile = await userProfiler.buildUserProfile(member, interaction.guild);
          aiAnalysis = await ollamaAI.analyzeUserProfile(userProfile);
        }
      } catch (aiError) {
        errorLogger.logWarn('WARN', 'AI Analysis failed', 'AI_ERROR', aiError);
      }

      // Update partnership
      partnership.status = 'active';
      partnership.approvedBy = interaction.user.id;
      // partnership.approvedAt is handled by timestamps or we can add it if schema supports, 
      // but schema has timestamps: true so updatedAt will change.
      // We'll use aiAnalysis field we added.
      if (!partnership.aiAnalysis) partnership.aiAnalysis = {};
      partnership.aiAnalysis.approvalAnalysis = aiAnalysis;
      partnership.aiAnalysis.timestamp = new Date();

      await partnership.save().catch(err => {
        errorLogger.logError('ERROR', 'Save failed', 'SAVE_ERROR', err);
        throw err;
      });

      errorLogger.logInfo('INFO', `Partnership approved: ${partnershipId}`, 'APPROVED');

      const embed = CustomEmbedBuilder.success('✅ Partnership Approvata',
        `**Server:** ${partnership.primaryGuild.serverName}\n` +
        `**ID:** \`${partnership.partnershipId}\`\n` +
        `**AI Analysis:** ${typeof aiAnalysis === 'string' ? aiAnalysis : 'Dati complessi'}\n` +
        `**Status:** Attiva`);


      // Crea i bottoni per la conferma/azione da parte dello staff
      const buttonHandler = new ButtonHandler(interaction.client.advancedLogger);
      const actionButtons = buttonHandler.createPartnershipActionButtons(partnership.partnershipId);
      await interaction.editReply({ embeds: [embed], components: [actionButtons] });
      errorLogger.logInfo('INFO', `Approval confirmed to ${partnership.primaryGuild.userId}`, 'CONFIRMED');
      interaction.client.advancedLogger?.partnership(`Partnership approval sent: ${partnership.partnershipId}`, `Action buttons displayed for staff confirmation`)

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
