const chalk = require('chalk');
const { EmbedBuilder } = require('discord.js');

/**
 * Sistema di Logging Avanzato
 * Registra tutto nel terminale E su Discord
 * Perfetto per il debugging e il tracking di partnership
 */
class AdvancedLogger {
  constructor(client) {
    this.client = client;
    this.logChannel = null;
    this.logHistory = [];
    this.maxHistory = 500;
  }

  /**
   * Inizializza il logger con il canale Discord
   */
  async initialize(logChannelId) {
    try {
      if (logChannelId) {
        this.logChannel = await this.client.channels.fetch(logChannelId);
      }
    } catch (error) {
      console.error(chalk.red('[LOGGER ERROR]'), 'Cannot fetch log channel:', error.message);
    }
  }

  /**
   * Log informativo
   */
  info(message, data = null) {
    const timestamp = this._getTimestamp();
    const fullMessage = `[INFO] ${timestamp} ${message}`;
    
    console.log(chalk.blue(fullMessage), data || '');
    this._addToHistory('INFO', message, data);
    this._sendToDiscord('ℹ️ INFO', message, data, '#3498db');
  }

  /**
   * Log di successo
   */
  success(message, data = null) {
    const timestamp = this._getTimestamp();
    const fullMessage = `[SUCCESS] ${timestamp} ${message}`;
    
    console.log(chalk.green(fullMessage), data || '');
    this._addToHistory('SUCCESS', message, data);
    this._sendToDiscord('✅ SUCCESS', message, data, '#2ecc71');
  }

  /**
   * Log di avvertimento
   */
  warn(message, data = null) {
    const timestamp = this._getTimestamp();
    const fullMessage = `[WARN] ${timestamp} ${message}`;
    
    console.log(chalk.yellow(fullMessage), data || '');
    this._addToHistory('WARN', message, data);
    this._sendToDiscord('⚠️ WARNING', message, data, '#f39c12');
  }

  /**
   * Log di errore
   */
  error(message, error = null, data = null) {
    const timestamp = this._getTimestamp();
    const fullMessage = `[ERROR] ${timestamp} ${message}`;
    
    console.error(chalk.red(fullMessage), error || '', data || '');
    this._addToHistory('ERROR', message, { error: error?.message, ...data });
    this._sendToDiscord('❌ ERROR', message, { error: error?.message, ...data }, '#e74c3c');
  }

  /**
   * Log per partnership (IMPORTANTE)
   */
  partnership(action, partnershipData, details = null) {
    const timestamp = this._getTimestamp();
    const fullMessage = `[PARTNERSHIP] ${timestamp} ${action} - ID: ${partnershipData.partnershipId}`;
    
    console.log(chalk.magenta(fullMessage), details || '');
    this._addToHistory('PARTNERSHIP', `${action} - ${partnershipData.partnershipId}`, { ...partnershipData, details });
    
    // Crea embed dettagliato per Discord
    const embed = new EmbedBuilder()
      .setColor('#9b59b6')
      .setTitle(`🤝 PARTNERSHIP: ${action.toUpperCase()}`)
      .addFields(
        { name: '🆔 ID', value: partnershipData.partnershipId, inline: true },
        { name: '🖥️ Server', value: partnershipData.serverName, inline: true },
        { name: '📊 Status', value: partnershipData.status, inline: true },
        { name: '👤 Richiesto da', value: `<@${partnershipData.requestedBy}>`, inline: true },
        { name: '📝 Descrizione', value: partnershipData.description.substring(0, 100) || 'N/A' }
      );
    
    if (details) {
      embed.addFields({ name: '📋 Dettagli', value: JSON.stringify(details).substring(0, 1024) });
    }
    
    embed.setTimestamp();
    embed.setFooter({ text: 'MinfoAI Partnership Logger' });
    
    this._sendEmbedToDiscord(embed);
  }

  /**
   * Log statistiche
   */
  stats(statsData) {
    const timestamp = this._getTimestamp();
    const fullMessage = `[STATS] ${timestamp} Partnership Statistics`;
    
    console.log(chalk.cyan(fullMessage), statsData);
    this._addToHistory('STATS', 'Partnership Statistics', statsData);
    
    const embed = new EmbedBuilder()
      .setColor('#1abc9c')
      .setTitle('📊 STATISTICS')
      .addFields(
        { name: '✅ Approvate', value: statsData.approved?.toString() || '0', inline: true },
        { name: '⏳ In Attesa', value: statsData.pending?.toString() || '0', inline: true },
        { name: '❌ Rifiutate', value: statsData.rejected?.toString() || '0', inline: true },
        { name: '📈 Totale', value: statsData.total?.toString() || '0', inline: true }
      );
    
    if (statsData.details) {
      embed.addFields({ name: '📋 Dettagli', value: statsData.details });
    }
    
    embed.setTimestamp();
    embed.setFooter({ text: 'MinfoAI Statistics' });
    
    this._sendEmbedToDiscord(embed);
  }

  /**
   * Ottieni la cronologia dei log
   */
  getHistory(type = null, limit = 50) {
    let history = this.logHistory;
    
    if (type) {
      history = history.filter(log => log.type === type);
    }
    
    return history.slice(-limit);
  }

  /**
   * Pulisci la cronologia
   */
  clearHistory() {
    this.logHistory = [];
  }

  // ========== PRIVATE METHODS ==========

  _getTimestamp() {
    const now = new Date();
    return `[${now.toLocaleTimeString('it-IT')}]`;
  }

  _addToHistory(type, message, data) {
    this.logHistory.push({
      type,
      message,
      data,
      timestamp: new Date()
    });
    
    // Mantieni solo gli ultimi 500 log
    if (this.logHistory.length > this.maxHistory) {
      this.logHistory = this.logHistory.slice(-this.maxHistory);
    }
  }

  async _sendToDiscord(title, message, data, color) {
    if (!this.logChannel) return;
    
    try {
      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(message)
        .setTimestamp()
        .setFooter({ text: 'MinfoAI Logger' });
      
      if (data) {
        const dataStr = typeof data === 'string' ? data : JSON.stringify(data).substring(0, 1024);
        embed.addFields({ name: 'Dati', value: dataStr });
      }
      
      await this.logChannel.send({ embeds: [embed] }).catch(err => {
        console.error(chalk.red('[DISCORD LOG ERROR]'), err.message);
      });
    } catch (error) {
      console.error(chalk.red('[DISCORD LOG ERROR]'), error.message);
    }
  }

  async _sendEmbedToDiscord(embed) {
    if (!this.logChannel) return;
    
    try {
      await this.logChannel.send({ embeds: [embed] }).catch(err => {
        console.error(chalk.red('[DISCORD LOG ERROR]'), err.message);
      });
    } catch (error) {
      console.error(chalk.red('[DISCORD LOG ERROR]'), error.message);
    }
  }
}

module.exports = AdvancedLogger;
