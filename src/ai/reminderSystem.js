const { EmbedBuilder } = require('discord.js');
const errorLogger = require('../utils/errorLogger');
const Partnership = require('../database/partnershipSchema');

/**
 * Sistema AI per promemoria partnership in attesa
 * Tiene traccia delle partnership in stato pending e invia promemoria periodici
 */
class ReminderSystem {
  constructor(client) {
    this.client = client;
    this.reminderInterval = process.env.REMINDER_INTERVAL_HOURS || 24; // ore
    this.startReminders();
  }

  /**
   * Avvia il sistema di promemoria
   */
  startReminders() {
    setInterval(async () => {
      try {
        await this.checkPendingPartnerships();
      } catch (error) {
        errorLogger.logError('ERROR', 'Errore nel sistema di promemoria', 'REMINDER_CHECK_ERROR', error);
      }
    }, this.reminderInterval * 60 * 60 * 1000); // Converti ore in millisecondi
  }

  /**
   * Controlla le partnership in attesa e invia promemoria
   */
  async checkPendingPartnerships() {
    try {
      const pendingPartnerships = await Partnership.find({ status: 'pending' });

      if (pendingPartnerships.length === 0) {
        errorLogger.logInfo('INFO', 'Nessuna partnership in attesa', 'NO_PENDING_PARTNERSHIPS');
        return;
      }

      for (const partnership of pendingPartnerships) {
        await this.sendReminderNotification(partnership);
      }
    } catch (error) {
      errorLogger.logError('ERROR', 'Errore nel controllo delle partnership in attesa', 'DB_QUERY_ERROR', error);
    }
  }

  /**
   * Invia notifiche di promemoria agli staff
   */
  async sendReminderNotification(partnership) {
    try {
      const logChannelId = process.env.LOG_CHANNEL_ID;
      const logChannel = await this.client.channels.fetch(logChannelId);

      if (!logChannel) {
        errorLogger.logWarn('WARN', 'Log channel non trovato', 'LOG_CHANNEL_NOT_FOUND');
        return;
      }

      // Calcola il tempo di attesa
      const waitingTime = Date.now() - new Date(partnership.requestedAt).getTime();
      const days = Math.floor(waitingTime / (1000 * 60 * 60 * 24));
      const hours = Math.floor((waitingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      const reminderEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('⏰ PROMEMORIA: Partnership in Attesa')
        .addFields(
          { name: '🆔 ID Partnership', value: partnership.partnershipId, inline: true },
          { name: '🖥️ Server', value: partnership.serverName, inline: true },
          { name: '👤 Richiedente', value: `<@${partnership.requestedBy}>`, inline: true },
          { name: '⏳ Tempo di Attesa', value: `${days}d ${hours}h`, inline: true },
          { name: '📝 Descrizione', value: partnership.description.substring(0, 100) + '...' },
          { name: '🔗 Link Invito', value: partnership.inviteLink || 'Non fornito', inline: false }
        )
        .setFooter({ text: 'MinfoAI - Sistema di Promemoria' })
        .setTimestamp();

      await logChannel.send({
        content: `<@&${process.env.STAFF_ROLE_ID}> Partnership da ${days > 0 ? days + ' giorni' : hours + ' ore'} in attesa di revisione!`,
        embeds: [reminderEmbed]
      });

      errorLogger.logInfo('INFO', `Promemoria inviato per partnership ${partnership.partnershipId}`, 'REMINDER_SENT');
    } catch (error) {
      errorLogger.logError('ERROR', 'Errore nell\'invio del promemoria', 'REMINDER_SEND_ERROR', error);
    }
  }

  /**
   * Invia un promemoria immediato (per testing)
   */
  async sendImmediateReminder(partnershipId) {
    try {
      const partnership = await Partnership.findOne({ partnershipId });

      if (!partnership) {
        errorLogger.logWarn('WARN', `Partnership non trovata: ${partnershipId}`, 'PARTNERSHIP_NOT_FOUND');
        return false;
      }

      await this.sendReminderNotification(partnership);
      return true;
    } catch (error) {
      errorLogger.logError('ERROR', 'Errore nell\'invio del promemoria immediato', 'IMMEDIATE_REMINDER_ERROR', error);
      return false;
    }
  }
}

module.exports = ReminderSystem;
