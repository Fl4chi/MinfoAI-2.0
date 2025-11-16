const errorLogger = require('../utils/errorLogger');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    errorLogger.logInfo('INFO', `Bot online come ${client.user.tag}`, 'BOT_READY');
    errorLogger.logInfo('INFO', `In ${client.guilds.cache.size} server`, 'BOT_GUILD_COUNT');
    
    client.user.setActivity('Partnership System v2.0', { type: 'WATCHING' });
    errorLogger.logInfo('INFO', 'Bot status updated', 'BOT_STATUS_SET');
  }
};
