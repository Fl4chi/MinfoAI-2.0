const ButtonHandler = require('../utils/buttonHandler');
const chalk = require('chalk');

/**
 * InteractionHandler - Gestisce tutte le interazioni (button clicks, select menus, etc.)
 * Integrato con AdvancedLogger per tracciare tutte le azioni
 */
class InteractionHandler {
  constructor(client, advancedLogger = null) {
    this.client = client;
    this.logger = advancedLogger;
    this.buttonHandler = new ButtonHandler(advancedLogger);
    this.handlers = {};
    this.setupInteractionListener();
  }

  /**
   * Configura l'event listener per le interazioni
   */
  setupInteractionListener() {
    this.client.on('interactionCreate', async (interaction) => {
      try {
        if (interaction.isButton()) {
          await this.handleButtonInteraction(interaction);
        } else if (interaction.isStringSelectMenu()) {
          await this.handleSelectMenuInteraction(interaction);
        } else if (interaction.isModalSubmit()) {
          await this.handleModalInteraction(interaction);
        }
      } catch (error) {
        if (this.logger) {
          this.logger.error(`[INTERACTION ERROR] ${error.message}`);
        } else {
          console.error(chalk.red(`[INTERACTION ERROR] ${error.message}`));
        }
      }
    });
  }

  /**
   * Gestisce le interazioni dei bottoni
   * @param {ButtonInteraction} interaction
   */
  async handleButtonInteraction(interaction) {
    try {
      if (this.logger) {
        this.logger.info(`[INTERACTION] Button interaction received: ${interaction.customId}`);
      } else {
        console.log(chalk.cyan(`[INTERACTION] Button: ${interaction.customId}`));
      }

      // Se esiste un handler personalizzato per questo bottone
      if (this.handlers.button && typeof this.handlers.button === 'function') {
        await this.handlers.button(interaction);
      } else {
        // Usa il ButtonHandler di default
        await this.buttonHandler.handleButtonInteraction(interaction, this.handlers.buttonActions || {});
      }
    } catch (error) {
      if (this.logger) {
        this.logger.error(`[BUTTON INTERACTION ERROR] ${error.message}`);
      } else {
        console.error(chalk.red(`[BUTTON INTERACTION ERROR] ${error.message}`));
      }
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Si è verificato un errore.',
          ephemeral: true
        }).catch(() => {});
      }
    }
  }

  /**
   * Gestisce le interazioni con select menu
   * @param {StringSelectMenuInteraction} interaction
   */
  async handleSelectMenuInteraction(interaction) {
    try {
      if (this.logger) {
        this.logger.info(`[INTERACTION] Select menu interaction: ${interaction.customId} | Values: ${interaction.values.join(', ')}`);
      } else {
        console.log(chalk.cyan(`[INTERACTION] Select Menu: ${interaction.customId}`));
      }

      // Se esiste un handler personalizzato
      if (this.handlers.selectMenu && typeof this.handlers.selectMenu === 'function') {
        await this.handlers.selectMenu(interaction);
      } else {
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply({
          content: '📋 Opzione selezionata. Elaborazione in corso...',
          ephemeral: true
        });
      }
    } catch (error) {
      if (this.logger) {
        this.logger.error(`[SELECT MENU ERROR] ${error.message}`);
      } else {
        console.error(chalk.red(`[SELECT MENU ERROR] ${error.message}`));
      }
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Errore nell\'elaborazione della selezione.',
          ephemeral: true
        }).catch(() => {});
      }
    }
  }

  /**
   * Gestisce le interazioni con modal (form)
   * @param {ModalSubmitInteraction} interaction
   */
  async handleModalInteraction(interaction) {
    try {
      if (this.logger) {
        this.logger.info(`[INTERACTION] Modal submission: ${interaction.customId}`);
      } else {
        console.log(chalk.cyan(`[INTERACTION] Modal: ${interaction.customId}`));
      }

      // Se esiste un handler personalizzato
      if (this.handlers.modal && typeof this.handlers.modal === 'function') {
        await this.handlers.modal(interaction);
      } else {
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply({
          content: '✓ Form ricevuto. Elaborazione in corso...',
          ephemeral: true
        });
      }
    } catch (error) {
      if (this.logger) {
        this.logger.error(`[MODAL ERROR] ${error.message}`);
      } else {
        console.error(chalk.red(`[MODAL ERROR] ${error.message}`));
      }
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Errore nell\'elaborazione del form.',
          ephemeral: true
        }).catch(() => {});
      }
    }
  }

  /**
   * Registra un handler personalizzato per i bottoni
   * @param {string} action - Azione (es: 'approve', 'reject')
   * @param {function} handler - Funzione handler
   */
  registerButtonHandler(action, handler) {
    if (!this.handlers.buttonActions) {
      this.handlers.buttonActions = {};
    }
    this.handlers.buttonActions[action] = handler;
    
    if (this.logger) {
      this.logger.info(`[HANDLER REGISTERED] Button handler for action: ${action}`);
    }
  }

  /**
   * Registra un handler personalizzato per i select menu
   * @param {function} handler - Funzione handler
   */
  registerSelectMenuHandler(handler) {
    this.handlers.selectMenu = handler;
    
    if (this.logger) {
      this.logger.info(`[HANDLER REGISTERED] Select menu handler registered`);
    }
  }

  /**
   * Registra un handler personalizzato per i modal
   * @param {function} handler - Funzione handler
   */
  registerModalHandler(handler) {
    this.handlers.modal = handler;
    
    if (this.logger) {
      this.logger.info(`[HANDLER REGISTERED] Modal handler registered`);
    }
  }

  /**
   * Ottiene il ButtonHandler per creare bottoni
   * @returns {ButtonHandler}
   */
  getButtonHandler() {
    return this.buttonHandler;
  }
}

module.exports = InteractionHandler;
