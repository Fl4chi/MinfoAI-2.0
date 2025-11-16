const fs = require('fs');
const path = require('path');
const errorLogger = require('../utils/errorLogger');

module.exports = async (client) => {
  const eventsPath = path.join(__dirname, '..', 'events');
  const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    const eventName = event.name || file.split('.')[0];

    if (event.once) {
      client.once(eventName, (...args) => event.execute(...args, client));
    } else {
      client.on(eventName, (...args) => event.execute(...args, client));
    }

    errorLogger.logInfo('INFO', `Loaded event: ${eventName}`, 'EVENT_LOADED');
  }
};
