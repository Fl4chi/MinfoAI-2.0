const { MessageFlags } = require('discord.js');
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
          flags: MessageFlags.Ephemeral
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
    }
  }
};

