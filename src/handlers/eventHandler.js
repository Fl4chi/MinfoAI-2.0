const fs = require('fs');
const path = require('path');
const errorLogger = require('../utils/errorLogger');

module.exports = async (client) => {
  try {
    const eventsPath = path.join(__dirname, '..', 'events');

    if (!fs.existsSync(eventsPath)) {
      errorLogger.logWarn('WARNING', 'Events directory not found', 'EVENT_DIR_MISSING');
      return;
    }

    const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

    for (const file of eventFiles) {
      try {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        const eventName = event.name || file.split('.')[0];

        if (event.once) {
          client.once(eventName, (...args) => event.execute(...args, client));
        } else {
          client.on(eventName, (...args) => event.execute(...args, client));
        }

        errorLogger.logInfo('INFO', `Loaded event: ${eventName}`, 'EVENT_LOADED');
      } catch (err) {
        errorLogger.logError('ERROR', `Failed to load event ${file}`, 'EVENT_LOAD_ERROR', err);
      }
    }
  } catch (err) {
    errorLogger.logError('CRITICAL', 'Error in event handler', 'EVENT_HANDLER_ERROR', err);
  }
};
