const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

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
  SETUP_FAILED: { code: 2005, message: 'Setup command failed', severity: 'CRITICAL' },

  // Errori di validazione (3000-3999)
  VALIDATION_FAILED: { code: 3001, message: 'Validation failed', severity: 'WARNING' },
  INVALID_GUILD_CONFIG: { code: 3002, message: 'Invalid guild configuration', severity: 'ERROR' },
  MISSING_GUILD_CONFIG: { code: 3003, message: 'Guild not configured', severity: 'WARNING' },
  PROFILE_INCOMPLETE: { code: 3004, message: 'Server profile incomplete', severity: 'WARNING' },
  INVALID_INVITE: { code: 3005, message: 'Invalid invite link', severity: 'WARNING' },

  // Errori di partnership & Economy (4000-4999)
  PARTNERSHIP_NOT_FOUND: { code: 4001, message: 'Partnership not found', severity: 'WARNING' },
  PARTNERSHIP_ALREADY_EXISTS: { code: 4002, message: 'Partnership already exists', severity: 'WARNING' },
  PARTNERSHIP_CREATION_FAILED: { code: 4003, message: 'Partnership creation failed', severity: 'ERROR' },
  AUTO_PARTNER_ERROR: { code: 4006, message: 'Auto-Partnership cycle failed', severity: 'ERROR' },
  ECO_ADD_USER_FAIL: { code: 4007, message: 'Failed to add coins to user', severity: 'ERROR' },
  ECO_SPEND_FAIL: { code: 4008, message: 'Insufficient funds or spend error', severity: 'WARNING' },

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
    this.docPath = path.join(__dirname, '../../BOT_DOCUMENTATION.md');
  }

  // Log con codice errore (con suggerimenti AI)
  async logError(severity, additionalInfo = '', errorCode = 'UNKNOWN_ERROR', error = null) {
    const timestamp = new Date().toLocaleTimeString('it-IT');
    const errorDef = ERROR_CODES[errorCode] || ERROR_CODES.UNKNOWN_ERROR;

    const logEntry = {
      timestamp,
      severity,
      errorCode,
      message: additionalInfo,
      error: error?.message,
      stack: error?.stack
    };

    this.logs.push(logEntry);

    // Output nel terminale
    const severityColor = this.getSeverityColor(severity);
    const codeStr = chalk.yellow(`[ERR-${errorCode}]`);
    const timeStr = chalk.gray(`[${timestamp}]`);
    const msg = severityColor(errorDef.message);
    const add = additionalInfo ? chalk.cyan(` - ${additionalInfo}`) : '';
    const errDetail = error ? chalk.red(` (${error.message})`) : '';

    console.log(`${timeStr} ${codeStr} ${msg}${add}${errDetail}`);
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

  /**
   * AI Error Doctor: Retrieves the solution for a given error code from documentation
   * @param {string} errorCode 
   * @returns {string} Solution text
   */
  getSolution(errorCode) {
    try {
      // Simple lookup for now, could be enhanced to parse MD file dynamically
      // But since we hardcoded the table in MD, we can also hardcode a fallback map or read the file.
      // Reading file is better for "AI" feel.

      if (!fs.existsSync(this.docPath)) return "Documentazione non trovata.";

      const content = fs.readFileSync(this.docPath, 'utf8');
      const lines = content.split('\n');

      for (const line of lines) {
        if (line.includes(`\`${errorCode}\``)) {
          // Format: | `CODE` | Error | Solution |
          const parts = line.split('|');
          if (parts.length >= 4) {
            return parts[3].trim();
          }
        }
      }

      return "Soluzione non trovata nella documentazione. Contatta il supporto.";
    } catch (e) {
      return "Errore nel recupero della soluzione.";
    }
  }
}

module.exports = new ErrorLogger();
