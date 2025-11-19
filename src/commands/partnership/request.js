const { SlashCommandBuilder } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const errorLogger = require('../../utils/errorLogger');
const ollamaAI = require('../../ai/ollamaAI');
const userProfiler = require('../../ai/userProfiler');
const { v4: uuidv4 } = require('uuid');
const { sendPartnershipNotification } = require('../../handlers/notificationHandler');
const ButtonHandler = require('../../utils/buttonHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnership-request')
    .setDescription('📬 Richiedi una partnership con questo server')
    .addStringOption(option =>
      option.setName('server-name')
        .setDescription('Nome del tuo server')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('invite-link')
        .setDescription('Link di invito permanente del tuo server')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Breve descrizione del tuo server')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const serverName = interaction.options.getString('server-name');
      const inviteLink = interaction.options.getString('invite-link');
      const description = interaction.options.getString('description');

      if (!inviteLink.includes('discord.gg') && !inviteLink.includes('discord.com/invite')) {
        errorLogger.logWarn('WARNING', `Invalid link from ${interaction.user.id}`, 'INVALID_INVITE');
        const embed = CustomEmbedBuilder.error('❌ Link Non Valido', 'Usa link Discord valido');
        return interaction.editReply({ embeds: [embed] });
      }

      if (description.length < 10 || description.length > 500) {
        errorLogger.logWarn('WARNING', `Invalid length: ${description.length}`, 'LENGTH_ERROR');
        const embed = CustomEmbedBuilder.error('❌ Descrizione Invalida', '10-500 caratteri');
        return interaction.editReply({ embeds: [embed] });
      }

      const existing = await Partnership.findOne({
        $or: [
          { 'primaryGuild.guildId': interaction.guildId },
          { 'secondaryGuild.guildId': interaction.guildId }
        ]
      }).catch(err => {
        errorLogger.logError('ERROR', 'DB query failed', 'DB_ERROR', err);
        throw err;
      });

      if (existing) {
        errorLogger.logWarn('WARNING', `Partnership exists`, 'EXISTS');
        const embed = CustomEmbedBuilder.error('❌ Già Esiste', `Status: ${existing.status}`);
        return interaction.editReply({ embeds: [embed] });
      }

      const userProfile = await userProfiler.buildUserProfile(interaction.user, interaction.guild);
      const aiAnalysis = await ollamaAI.analyzeUserProfile(userProfile);
      const credScore = calculateCredibility(userProfile);

      const partnership = new Partnership({
        partnershipId: uuidv4(),
        status: 'pending',
        primaryGuild: {
          guildId: interaction.guildId,
          guildName: interaction.guild.name,
          serverName: serverName,
          inviteLink: inviteLink,
          description: description,
          userId: interaction.user.id
        },
        aiAnalysis: {
          userProfile: aiAnalysis,
          credibilityScore: credScore,
          timestamp: new Date()
        },
        createdAt: new Date()
      });

      await partnership.save().catch(err => {
        errorLogger.logError('ERROR', 'Save failed', 'SAVE_ERROR', err);
        throw err;
      });

      errorLogger.logInfo('INFO', `Partnership created: ${partnership.partnershipId}`, 'CREATED');

      // Send notifications to staff
      try {
        const staffRoleId = process.env.STAFF_ROLE_ID;
        const guild = interaction.guild;
        await sendPartnershipNotification(interaction.client, partnership, staffRoleId, guild);
      } catch (notifError) {
        errorLogger.logWarn('WARN', 'Failed to send notifications', 'NOTIF_FAIL');
      }

      // Crea i bottoni per l'approvazione/rifiuto da parte dello staff
      const buttonHandler = new ButtonHandler(interaction.client.advancedLogger);
      const decisionButtons = buttonHandler.createPartnershipDecisionButtons(partnership.partnershipId);

      const embed = CustomEmbedBuilder.success('✅ Richiesta Inviata',
        `Partnership per **${serverName}** inviata!\n\n` +
        `**ID:** \`${partnership.partnershipId}\`\n` +
        `**Profilo AI:** ${aiAnalysis}\n` +
        `**Credibilità:** ${'⭐'.repeat(Math.ceil(credScore / 20))} (${credScore}%)\n` +
        `**Status:** In attesa`);

      await interaction.editReply({ embeds: [embed], components: [decisionButtons] });
      interaction.client.advancedLogger?.partnership(`Partnership request sent: ${partnership.partnershipId}`, `Buttons displayed for staff approval`)
      errorLogger.logInfo('INFO', `Request sent`, 'SENT');

    } catch (error) {
      errorLogger.logError('ERROR', 'Command failed', 'FAILED', error);
      const embed = CustomEmbedBuilder.error('❌ Errore', 'Riprova dopo');
      try {
        await interaction.editReply({ embeds: [embed] });
      } catch (e) {
        errorLogger.logError('ERROR', 'Reply error', 'REPLY_ERROR', e);
      }
    }
  }
};

function calculateCredibility(userProfile) {
  try {
    let score = 0;
    const daysSinceJoin = Math.floor((Date.now() - userProfile.joinDate) / (1000 * 60 * 60 * 24));
    score += Math.min(daysSinceJoin * 2, 30);
    score += Math.min(userProfile.totalMessages / 50, 20);
    score += (userProfile.partnershipsCompleted || 0) * 10;
    score += Math.min((userProfile.coins || 0) / 100, 15);
    score += Math.min((userProfile.reputation || 0) * 5, 15);
    return Math.min(score, 100);
  } catch (error) {
    errorLogger.logError('ERROR', 'Calc error', 'CALC_ERROR', error);
    return 50;
  }
}
