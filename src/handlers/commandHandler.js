const fs = require('fs');
const path = require('path');
const errorLogger = require('../utils/errorLogger');

module.exports = async (client) => {
  try {
    const commandsPath = path.join(__dirname, '..', 'commands');

    if (!fs.existsSync(commandsPath)) {
      errorLogger.logWarn('WARNING', 'Commands directory not found', 'COMMAND_DIR_MISSING');
      return;
    }

    const commandFolders = fs.readdirSync(commandsPath).filter(f => {
      return fs.statSync(path.join(commandsPath, f)).isDirectory();
    });

    for (const folder of commandFolders) {
      const folderPath = path.join(commandsPath, folder);
      const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));

      for (const file of files) {
        try {
          const filePath = path.join(folderPath, file);
          const command = require(filePath);

          if (command.data && command.execute) {
            client.commands.set(command.data.name, command);
            errorLogger.logInfo('INFO', `Loaded command: ${command.data.name}`, 'COMMAND_LOADED');
          } else {
            errorLogger.logWarn('WARNING', `Command file ${file} missing data or execute`, 'COMMAND_LOAD_INVALID');
          }
        } catch (err) {
          errorLogger.logError('ERROR', `Failed to load command ${file}`, 'COMMAND_LOAD_ERROR', err);
        }
      }
    }
  } catch (err) {
    errorLogger.logError('CRITICAL', 'Error in command handler', 'COMMAND_HANDLER_ERROR', err);
  }
};
