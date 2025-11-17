const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const errorLogger = require('../utils/errorLogger');
const CustomEmbedBuilder = require('../utils/embedBuilder');

/**
 * Send partnership notification to admin via DM with quick action buttons
 * @param {Client} client - Discord client
 * @param {Object} partnership - Partnership data
 * @param {String} staffRoleId - Role ID of staff members
 * @param {Guild} guild - Guild object
 */
const sendPartnershipNotification = async (client, partnership, staffRoleId, guild) => {
  try {
    if (!staffRoleId || !guild) {
      errorLogger.logError('ERROR', 'Missing staffRoleId or guild', 'NOTIFICATION_ERROR');
      return;
    }

    // Get all members with staff role
    const staffMembers = await guild.members.fetch().then(members => 
      members.filter(m => m.roles.has(staffRoleId))
    ).catch(err => {
      errorLogger.logError('ERROR', 'Failed to fetch staff members', 'FETCH_ERROR', err);
      return [];
    });

    if (staffMembers.size === 0) {
      errorLogger.logWarn('WARN', 'No staff members found with role', 'NO_STAFF');
      return;
    }

    // Create notification embed
    const notificationEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🤝 Nuova Richiesta Partnership')
      .setDescription(`Una nuova richiesta di partnership è in sospeso!`)
      .addFields(
        { name: '🆔 Partnership ID', value: partnership.partnershipId, inline: true },
        { name: '📊 Stato', value: partnership.status.toUpperCase(), inline: true },
        { name: '🏢 Server', value: partnership.serverName || 'N/A', inline: false },
        { name: '👤 Richiesto da', value: `<@${partnership.requestedBy}>`, inline: true },
        { name: '📅 Data', value: new Date(partnership.requestedAt).toLocaleString('it-IT'), inline: true },
        { name: '📝 Descrizione', value: partnership.description || 'Nessuna descrizione fornita', inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'MinfoAI Partnership System | Clicca i bottoni sottostanti per agire' });

    // Create action buttons
    const actionRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`approve_${partnership.partnershipId}`)
          .setLabel('✅ Approva')
          .setStyle(ButtonStyle.Success)
          .setEmoji('✅'),
        new ButtonBuilder()
          .setCustomId(`reject_${partnership.partnershipId}`)
          .setLabel('❌ Rifiuta')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('❌'),
        new ButtonBuilder()
          .setCustomId(`view_${partnership.partnershipId}`)
          .setLabel('👁️ Visualizza')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('👁️')
      );

    // Send DM to each staff member
    let successCount = 0;
    let failCount = 0;

    for (const [, member] of staffMembers) {
      try {
        // Check if user has notifications enabled and is not a bot
        if (!member.user.bot) {
          await member.user.send({
            embeds: [notificationEmbed],
            components: [actionRow]
          }).catch(err => {
            errorLogger.logWarn('WARN', `Could not DM user ${member.id}`, 'DM_FAILED');
          });
          successCount++;
        }
      } catch (error) {
        errorLogger.logError('ERROR', `Failed to send DM to ${member.id}`, 'DM_ERROR', error);
        failCount++;
      }
    }

    errorLogger.logInfo('INFO', `Partnership notification sent to ${successCount} staff members`, 'NOTIFICATION_SENT');
    if (failCount > 0) {
      errorLogger.logWarn('WARN', `Failed to send notification to ${failCount} staff members`, 'PARTIAL_FAIL');
    }

  } catch (error) {
    errorLogger.logError('ERROR', 'Notification handler error', 'HANDLER_ERROR', error);
  }
};

/**
 * Send partnership update notification
 * @param {Client} client - Discord client
 * @param {Object} partnership - Partnership data
 * @param {String} action - Action type (approved, rejected, deleted)
 * @param {String} staffRoleId - Role ID of staff members
 * @param {Guild} guild - Guild object
 */
const sendPartnershipUpdate = async (client, partnership, action, staffRoleId, guild) => {
  try {
    const actionText = {
      'approved': '✅ Approvata',
      'rejected': '❌ Rifiutata',
      'deleted': '🗑️ Eliminata'
    };

    const updateEmbed = new EmbedBuilder()
      .setColor(action === 'approved' ? '#57F287' : action === 'rejected' ? '#ED4245' : '#FFA500')
      .setTitle(`🤝 Partnership ${actionText[action] || action}`)
      .addFields(
        { name: '🆔 ID', value: partnership.partnershipId, inline: true },
        { name: '🏢 Server', value: partnership.serverName || 'N/A', inline: true },
        { name: '⏰ Timestamp', value: new Date().toLocaleString('it-IT'), inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'MinfoAI Partnership System' });

    if (partnership.rejectionReason) {
      updateEmbed.addFields(
        { name: '❌ Motivo Rifiuto', value: partnership.rejectionReason, inline: false }
      );
    }

    // Get staff members and notify
    const staffMembers = await guild.members.fetch().then(members => 
      members.filter(m => m.roles.has(staffRoleId))
    ).catch(() => new Map());

    for (const [, member] of staffMembers) {
      try {
        if (!member.user.bot) {
          await member.user.send({ embeds: [updateEmbed] }).catch(() => {});
        }
      } catch (error) {
        // Silent fail
      }
    }

    errorLogger.logInfo('INFO', `Partnership update notification sent (${action})`, 'UPDATE_NOTIFIED');

  } catch (error) {
    errorLogger.logError('ERROR', 'Update notification error', 'UPDATE_ERROR', error);
  }
};

module.exports = {
  sendPartnershipNotification,
  sendPartnershipUpdate
};
