const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const chalk = require('chalk');

/**
 * ButtonHandler - Gestisce la creazione e il routing dei bottoni per le partnership
 * Supporta: Approve, Reject, View Details, Cancel
 */
class ButtonHandler {
  constructor(advancedLogger = null) {
    this.logger = advancedLogger;
  }

  /**
   * Crea una riga di bottoni per l'approvazione/rifiuto di una partnership
   * @param {string} partnerId - ID della partnership
   * @returns {ActionRowBuilder} Riga con bottoni approve/reject/view
   */
  createPartnershipDecisionButtons(partnerId) {
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`approve_${partnerId}`)
          .setLabel('✅ Approva')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`reject_${partnerId}`)
          .setLabel('❌ Rifiuta')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`view_${partnerId}`)
          .setLabel('📋 Visualizza')
          .setStyle(ButtonStyle.Primary)
      );
    return row;
  }

  /**
   * Crea bottoni per la conferma di azioni
   * @param {string} actionId - ID dell'azione
   * @returns {ActionRowBuilder} Riga con bottoni confirm/cancel
   */
  createConfirmationButtons(actionId) {
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`confirm_${actionId}`)
          .setLabel('✓ Conferma')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`cancel_${actionId}`)
          .setLabel('✗ Annulla')
          .setStyle(ButtonStyle.Secondary)
      );
    return row;
  }

  /**
   * Crea bottoni per le azioni di gestione partnership
   * @param {string} partnerId - ID della partnership
   * @returns {ActionRowBuilder} Riga con bottoni manage/edit/remove
   */
  createManagementButtons(partnerId) {
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`edit_${partnerId}`)
          .setLabel('✏️ Modifica')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`stats_${partnerId}`)
          .setLabel('📈 Statistiche')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`remove_${partnerId}`)
          .setLabel('🗑️ Rimuovi')
          .setStyle(ButtonStyle.Danger)
      );
    return row;
  }

  /**
   * Estrae l'azione e l'ID dal customId del bottone
   * @param {string} customId - ID personalizzato del bottone (es: "approve_123")
   * @returns {object} Oggetto {action, id}
   */
  parseButtonId(customId) {
    const parts = customId.split('_');
    const action = parts[0];
    const id = parts.slice(1).join('_');
    return { action, id };
  }

  /**
   * Gestisce l'interazione con un bottone
   * @param {ButtonInteraction} interaction - Interazione del bottone
   * @param {object} handlers - Oggetto con funzioni handler per ogni azione
   */
  async handleButtonInteraction(interaction, handlers = {}) {
    try {
      const { action, id } = this.parseButtonId(interaction.customId);
      
      if (this.logger) {
        this.logger.info(`[BUTTON] Bottone cliccato: ${action} | Partner ID: ${id} | Utente: ${interaction.user.tag}`);
      } else {
        console.log(chalk.blue(`[BUTTON] ${action.toUpperCase()} | ID: ${id} | User: ${interaction.user.tag}`));
      }

      // Defer la risposta per evitare timeout
      await interaction.deferReply({ ephemeral: true });

      // Chiama l'handler specifico se esiste
      if (handlers[action] && typeof handlers[action] === 'function') {
        await handlers[action](interaction, id);
      } else {
        // Handler di default
        await this.defaultButtonHandler(interaction, action, id);
      }
    } catch (error) {
      if (this.logger) {
        this.logger.error(`[BUTTON ERROR] ${error.message}`);
      } else {
        console.error(chalk.red(`[BUTTON ERROR] ${error.message}`));
      }
      
      if (!interaction.replied) {
        await interaction.editReply({
          content: '❌ Si è verificato un errore durante l\'elaborazione del bottone.',
          ephemeral: true
        }).catch(() => {});
      }
    }
  }

  /**
   * Handler di default per i bottoni (fallback)
   * @param {ButtonInteraction} interaction
   * @param {string} action
   * @param {string} id
   */
  async defaultButtonHandler(interaction, action, id) {
    const messages = {
      approve: '✅ Partnership approvata con successo!',
      reject: '❌ Partnership rifiutata.',
      view: '📋 Caricamento dettagli partnership...',
      confirm: '✓ Azione confermata.',
      cancel: '✗ Azione annullata.',
      edit: '✏️ Modifica partnership avviata...',
      stats: '📈 Statistiche partnership caricate...',
      remove: '🗑️ Partnership rimossa.'
    };

    const message = messages[action] || `Azione: ${action}`;
    await interaction.editReply({ content: message, ephemeral: true });
  }

  /**
   * Raccoglie bottoni multipli in una singola riga
   * @param {array} buttons - Array di ButtonBuilder
   * @returns {ActionRowBuilder}
   */
  createCustomRow(buttons = []) {
    const row = new ActionRowBuilder();
    buttons.forEach(btn => {
      if (btn instanceof ButtonBuilder) {
        row.addComponents(btn);
      }
    });
    return row;
  }
}

module.exports = ButtonHandler;
