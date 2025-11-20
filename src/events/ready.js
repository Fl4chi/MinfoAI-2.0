const { ActivityType } = require('discord.js');
const errorLogger = require('../utils/errorLogger');
const deployCommands = require('../handlers/deployCommands');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    errorLogger.logInfo('INFO', `Bot online come ${client.user.tag}`, 'BOT_READY');
    errorLogger.logInfo('INFO', `In ${client.guilds.cache.size} server`, 'BOT_GUILD_COUNT');

    client.user.setActivity('MinfoAI', { type: ActivityType.Watching });
    errorLogger.logInfo('INFO', 'Bot status updated', 'BOT_STATUS_SET');

    // Deploy Commands
    await deployCommands(client);
  }
};
