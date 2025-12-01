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

    const readEvents = (dir) => {
      const files = fs.readdirSync(dir, { withFileTypes: true });

      for (const file of files) {
        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {
          readEvents(fullPath);
        } else if (file.name.endsWith('.js')) {
          try {
            const event = require(fullPath);
            const eventName = event.name || file.name.split('.')[0];

            if (event.once) {
              client.once(eventName, (...args) => event.execute(...args, client));
            } else {
              client.on(eventName, (...args) => event.execute(...args, client));
            }

            errorLogger.logInfo('INFO', `Loaded event: ${eventName}`, 'EVENT_LOADED');
          } catch (err) {
            errorLogger.logError('ERROR', `Failed to load event ${file.name}`, 'EVENT_LOAD_ERROR', err);
          }
        }
      }
    };

    readEvents(eventsPath);
  } catch (err) {
    errorLogger.logError('CRITICAL', 'Error in event handler', 'EVENT_HANDLER_ERROR', err);
  }
};
