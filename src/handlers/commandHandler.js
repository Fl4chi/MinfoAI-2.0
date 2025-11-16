const fs = require('fs');
const path = require('path');
const errorLogger = require('../utils/errorLogger');

module.exports = async (client) => {
  const commandsPath = path.join(__dirname, '..', 'commands');

  const commandFolders = fs.readdirSync(commandsPath).filter(f => {
    return fs.statSync(path.join(commandsPath, f)).isDirectory();
  });

  for (const folder of commandFolders) {
    const files = fs.readdirSync(path.join(commandsPath, folder)).filter(f => f.endsWith('.js'));

    for (const file of files) {
      const command = require(path.join(commandsPath, folder, file));
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        errorLogger.logInfo('INFO', `Loaded command: ${command.data.name}`, 'COMMAND_LOADED');
      } else {
        errorLogger.logWarn('WARNING', `Command file ${file} missing data or execute`, 'COMMAND_LOAD_INVALID');
      }
    }
  }
};
