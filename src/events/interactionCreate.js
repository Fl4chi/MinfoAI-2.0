const errorLogger = require('../utils/errorLogger');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Handle slash commands
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        errorLogger.logError('ERROR', `No command matching ${interaction.commandName} was found.`, 'COMMAND_NOT_FOUND');
        return;
      }

      try {
        await command.execute(interaction);
        errorLogger.logInfo('INFO', `Command executed: ${interaction.commandName}`, 'COMMAND_EXECUTED');
      } catch (error) {
        errorLogger.logError('ERROR', `Error executing ${interaction.commandName}: ${error.message}`, 'COMMAND_EXECUTION_FAILED');

        // Robust error handling with reply safety
        const errorMessage = {
          content: 'There was an error while executing this command!',
          ephemeral: true
        };

        try {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
          } else {
            await interaction.reply(errorMessage);
          }
        } catch (replyError) {
          errorLogger.logError('ERROR', `Could not send error message to user: ${replyError.message}`, 'ERROR_REPLY_FAILED');
        }
      }
      
    // Handle button interactions for partnership notifications
    if (interaction.isButton()) {
      const buttonId = interaction.customId;
      
      // Handle partnership approval/rejection buttons
      if (buttonId.startsWith('approve_') || buttonId.startsWith('reject_') || buttonId.startsWith('view_')) {
        try {
          const partnershipId = buttonId.split('_')[1];
          errorLogger.logInfo('INFO', `Partnership button interaction: ${buttonId}`, 'BUTTON_CLICK');
          
          // Defer the interaction first
          await interaction.deferReply({ ephemeral: true });
          
          // You can add more specific logic here for each button type
          if (buttonId.startsWith('approve_')) {
            await interaction.editReply({ content: '✅ Partnership approvata! Usa `/partner-approve` per completare.' });
          } else if (buttonId.startsWith('reject_')) {
            await interaction.editReply({ content: '❌ Usa `/partner-reject` per rifiutare con motivo.' });
          } else if (buttonId.startsWith('view_')) {
            await interaction.editReply({ content: '👁️ Usa `/partner-view` per visualizzare i dettagli.' });
          }
        } catch (buttonError) {
          errorLogger.logError('ERROR', 'Button interaction error', 'BUTTON_ERROR', buttonError);
          try {
            await interaction.reply({ content: '❌ Errore nel processare il button', ephemeral: true });
          } catch (e) { /* silent fail */ }
        }
      }
    }
    }
  }
};
