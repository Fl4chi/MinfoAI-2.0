/**
 * Logging System completo per MinfoAI-2.0
 * Traccia tutte le operazioni, errors, e analytics
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logsDir = path.join(process.cwd(), 'logs');
    this.ensureLogsDirectory();
  }

  ensureLogsDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatLog(level, message, data = {}) {
    return JSON.stringify({
      timestamp: this.getTimestamp(),
      level,
      message,
      data,
    });
  }

  writeToFile(level, message, data) {
    const fileName = `${level.toLowerCase()}-${new Date().toISOString().split('T')[0]}.log`;
    const filePath = path.join(this.logsDir, fileName);
    const logLine = this.formatLog(level, message, data) + '\n';
    
    fs.appendFileSync(filePath, logLine);
  }

  info(message, data = {}) {
    console.log(`[INFO] ${message}`, data);
    this.writeToFile('INFO', message, data);
  }

  error(message, error = null, context = {}) {
    const errorData = {
      ...context,
      errorMessage: error?.message,
      errorStack: error?.stack,
    };
    console.error(`[ERROR] ${message}`, errorData);
    this.writeToFile('ERROR', message, errorData);
  }

  warn(message, data = {}) {
    console.warn(`[WARN] ${message}`, data);
    this.writeToFile('WARN', message, data);
  }

  debug(message, data = {}) {
    if (process.env.DEBUG === 'true') {
      console.debug(`[DEBUG] ${message}`, data);
      this.writeToFile('DEBUG', message, data);
    }
  }

  partnership(action, partnershipId, data = {}) {
    const logData = {
      action,
      partnershipId,
      ...data,
    };
    this.writeToFile('PARTNERSHIP', action, logData);
  }

  analytics(event, userId, data = {}) {
    const logData = {
      event,
      userId,
      ...data,
    };
    this.writeToFile('ANALYTICS', event, logData);
  }
}

module.exports = new Logger();
