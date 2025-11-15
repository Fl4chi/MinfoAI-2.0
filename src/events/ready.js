const logger = require('../utils/logger');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    logger.success(`Bot online come ${client.user.tag}`);
    logger.info(`In ${client.guilds.cache.size} server`);
    
    client.user.setActivity('Partnership System v2.0', { type: 'WATCHING' });
  }
};
