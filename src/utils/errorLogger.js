const chalk = require('chalk');

// Error Code Registry - TUTTI GLI ERRORI DEL BOT
const ERROR_CODES = {
  // Errori di connessione (1000-1999)
  DB_CONNECTION_FAILED: { code: 1001, message: 'Database connection failed', severity: 'CRITICAL' },
  DB_QUERY_FAILED: { code: 1002, message: 'Database query failed', severity: 'ERROR' },
  DISCORD_CONNECTION_FAILED: { code: 1003, message: 'Discord connection failed', severity: 'CRITICAL' },
  
  // Errori di comando (2000-2999)
  COMMAND_NOT_FOUND: { code: 2001, message: 'Command not found', severity: 'WARNING' },
  COMMAND_EXECUTION_FAILED: { code: 2002, message: 'Command execution failed', severity: 'ERROR' },
  MISSING_PERMISSIONS: { code: 2003, message: 'Missing required permissions', severity: 'WARNING' },
  INVALID_ARGUMENTS: { code: 2004, message: 'Invalid command arguments', severity: 'WARNING' },
  
  // Errori di validazione (3000-3999)
  VALIDATION_FAILED: { code: 3001, message: 'Validation failed', severity: 'WARNING' },
  INVALID_GUILD_CONFIG: { code: 3002, message: 'Invalid guild configuration', severity: 'ERROR' },
  MISSING_GUILD_CONFIG: { code: 3003, message: 'Guild not configured', severity: 'WARNING' },
  
  // Errori di partnership (4000-4999)
  PARTNERSHIP_NOT_FOUND: { code: 4001, message: 'Partnership not found', severity: 'WARNING' },
  PARTNERSHIP_ALREADY_EXISTS: { code: 4002, message: 'Partnership already exists', severity: 'WARNING' },
  PARTNERSHIP_CREATION_FAILED: { code: 4003, message: 'Partnership creation failed', severity: 'ERROR' },
  PARTNERSHIP_UPDATE_FAILED: { code: 4004, message: 'Partnership update failed', severity: 'ERROR' },
  PARTNERSHIP_DELETE_FAILED: { code: 4005, message: 'Partnership deletion failed', severity: 'ERROR' },
  
  // Errori di API (5000-5999)
  API_REQUEST_FAILED: { code: 5001, message: 'API request failed', severity: 'ERROR' },
  API_TIMEOUT: { code: 5002, message: 'API request timeout', severity: 'ERROR' },
  
  // Errori di autorizzazione (6000-6999)
  UNAUTHORIZED: { code: 6001, message: 'Unauthorized action', severity: 'WARNING' },
  FORBIDDEN: { code: 6002, message: 'Access forbidden', severity: 'WARNING' },
  
  // Errori generici (9000-9999)
  UNKNOWN_ERROR: { code: 9001, message: 'Unknown error occurred', severity: 'ERROR' },
  NOT_IMPLEMENTED: { code: 9002, message: 'Feature not implemented', severity: 'WARNING' }
};

class ErrorLogger {
  constructor() {
    this.logs = [];
    this.startTime = new Date();
  }

  // Log con codice errore
  logError(errorCode, additionalInfo = '', context = '') {
    const errorData = ERROR_CODES[errorCode] || ERROR_CODES.UNKNOWN_ERROR;
    const timestamp = new Date().toLocaleTimeString('it-IT');
    const logEntry = {
      code: errorData.code,
      timestamp,
      errorCode,
      message: errorData.message,
      severity: errorData.severity,
      additionalInfo,
      context
    };

    this.logs.push(logEntry);

    // Output nel terminale
    const severityColor = this.getSeverityColor(errorData.severity);
    const codeStr = chalk.yellow(`[ERR-${errorData.code}]`);
    const timeStr = chalk.gray(`[${timestamp}]`);
    const msg = severityColor(errorData.message);
    const add = additionalInfo ? chalk.cyan(` - ${additionalInfo}`) : '';
    const ctx = context ? chalk.gray(` (${context})`) : '';

    console.log(`${timeStr} ${codeStr} ${msg}${add}${ctx}`);
  }

  // Log di info/success
  logInfo(message, context = '') {
    const timestamp = new Date().toLocaleTimeString('it-IT');
    const timeStr = chalk.gray(`[${timestamp}]`);
    const msg = chalk.green(`✓ ${message}`);
    const ctx = context ? chalk.gray(` (${context})`) : '';
    console.log(`${timeStr} ${msg}${ctx}`);
  }

  // Log di warning
  logWarn(message, context = '') {
    const timestamp = new Date().toLocaleTimeString('it-IT');
    const timeStr = chalk.gray(`[${timestamp}]`);
    const msg = chalk.yellow(`⚠ ${message}`);
    const ctx = context ? chalk.gray(` (${context})`) : '';
    console.log(`${timeStr} ${msg}${ctx}`);
  }

  // Log di debug
  logDebug(message, context = '') {
    if (process.env.DEBUG === 'true') {
      const timestamp = new Date().toLocaleTimeString('it-IT');
      const timeStr = chalk.gray(`[${timestamp}]`);
      const msg = chalk.blue(`🔧 ${message}`);
      const ctx = context ? chalk.gray(` (${context})`) : '';
      console.log(`${timeStr} ${msg}${ctx}`);
    }
  }

  // Ottieni colore in base a severità
  getSeverityColor(severity) {
    const colors = {
      'CRITICAL': chalk.red,
      'ERROR': chalk.bgRed.white,
      'WARNING': chalk.yellow,
      'INFO': chalk.cyan
    };
    return colors[severity] || chalk.white;
  }

  // Stampa statistica errori
  printStatistics() {
    console.log('\n' + chalk.cyan('═══════════════════════════════════════'));
    console.log(chalk.cyan('📊 ERROR LOG STATISTICS'));
    console.log(chalk.cyan('═══════════════════════════════════════'));
    
    const critical = this.logs.filter(l => ERROR_CODES[l.errorCode]?.severity === 'CRITICAL').length;
    const errors = this.logs.filter(l => ERROR_CODES[l.errorCode]?.severity === 'ERROR').length;
    const warnings = this.logs.filter(l => ERROR_CODES[l.errorCode]?.severity === 'WARNING').length;

    console.log(chalk.red(`  🔴 CRITICAL: ${critical}`));
    console.log(chalk.bgRed.white(`  ❌ ERRORS: ${errors}`));
    console.log(chalk.yellow(`  ⚠️  WARNINGS: ${warnings}`));
    console.log(chalk.cyan('═══════════════════════════════════════\n'));
  }

  // Ottieni error code list
  getErrorCodes() {
    return ERROR_CODES;
  }
}

module.exports = new ErrorLogger();
