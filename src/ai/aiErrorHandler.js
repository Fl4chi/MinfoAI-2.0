const errorLogger = require('../utils/errorLogger');
const AdvancedLogger = require('../utils/advancedLogger');

/**
 * Sistema avanzato di gestione errori con AI
 * Integra il rilevamento e l'analisi degli errori con AI
 */
class AIErrorHandler {
  constructor() {
        this.logger = logger;
    this.errorPatterns = new Map();
    this.errorHistory = [];
    this.maxHistorySize = 1000;
  }

  /**
   * Registra e analizza un errore con AI
   */
  async handleError(errorType, errorMessage, errorCode, error, context = {}) {
    try {
      const errorEntry = {
        timestamp: new Date(),
        type: errorType,
        message: errorMessage,
        code: errorCode,
        stack: error?.stack,
        context,
        severity: this.calculateSeverity(errorCode),
        aiAnalysis: null
      };

      // Analizza l'errore con AI
      errorEntry.aiAnalysis = await this.analyzeErrorWithAI(errorEntry);

      // Registra l'errore
      this.recordError(errorEntry);

      // Invia al logger
      this.logger?.error(errorType, errorMessage, errorCode, error);

      return errorEntry;
    } catch (err) {
      this.logger?.error('CRITICAL', 'Errore nel handler di errori AI', 'AI_ERROR_HANDLER_FAILED', err);
    }
  }

  /**
   * Analizza un errore e fornisce suggerimenti con AI
   */
  async analyzeErrorWithAI(errorEntry) {
    try {
      const analysis = {
        pattern: this.identifyPattern(errorEntry),
        suggestion: this.generateSuggestion(errorEntry),
        frequency: this.calculateFrequency(errorEntry.code),
        severity: errorEntry.severity,
        autoFix: this.suggestAutoFix(errorEntry)
      };

      return analysis;
    } catch (err) {
      this.logger?.warn('WARN', 'Errore nell\'analisi AI dell\'errore', 'AI_ANALYSIS_FAILED');
      return null;
    }
  }

  /**
   * Identifica pattern di errore ricorrenti
   */
  identifyPattern(errorEntry) {
    const { code, message } = errorEntry;
    
    if (this.errorPatterns.has(code)) {
      const pattern = this.errorPatterns.get(code);
      pattern.count++;
      return pattern;
    }

    const newPattern = {
      code,
      message,
      count: 1,
      firstOccurrence: errorEntry.timestamp
    };

    this.errorPatterns.set(code, newPattern);
    return newPattern;
  }

  /**
   * Genera suggerimenti per risolvere l'errore
   */
  generateSuggestion(errorEntry) {
    const suggestions = {
      'DB_CONNECTION_FAILED': 'Verifica la connessione MongoDB. Controlla MONGODB_URI nel .env',
      'DISCORD_CONNECTION_FAILED': 'Verifica il token Discord. Assicurati che sia valido',
      'DB_QUERY_ERROR': 'Errore nella query del database. Controlla lo schema dei dati',
      'REMINDER_CHECK_ERROR': 'Errore nel sistema di promemoria. Controlla le partnership in DB',
      'COMMAND_EXECUTION_ERROR': 'Errore nell\'esecuzione del comando. Verifica i permessi',
      'PARTNERSHIP_NOT_FOUND': 'Partnership non trovata nel database',
      'UNHANDLED_REJECTION': 'Promise rejection non gestita. Aggiungi try-catch'
    };

    return suggestions[errorEntry.code] || 'Errore sconosciuto. Controlla il log per più dettagli';
  }

  /**
   * Calcola la frequenza di un errore
   */
  calculateFrequency(errorCode) {
    const count = this.errorHistory.filter(e => e.code === errorCode).length;
    return {
      count,
      percentage: ((count / this.errorHistory.length) * 100).toFixed(2) + '%',
      status: count > 10 ? 'FREQUENT' : count > 5 ? 'MODERATE' : 'RARE'
    };
  }

  /**
   * Calcola la severità di un errore
   */
  calculateSeverity(errorCode) {
    const criticalErrors = ['DB_CONNECTION_FAILED', 'DISCORD_CONNECTION_FAILED', 'UNCAUGHT_EXCEPTION'];
    if (criticalErrors.includes(errorCode)) return 'CRITICAL';
    
    const highErrors = ['DB_QUERY_ERROR', 'COMMAND_EXECUTION_ERROR', 'UNHANDLED_REJECTION'];
    if (highErrors.includes(errorCode)) return 'HIGH';
    
    return 'MEDIUM';
  }

  /**
   * Suggerisce una correzione automatica
   */
  suggestAutoFix(errorEntry) {
    const { code } = errorEntry;
    
    const autoFixes = {
      'DB_CONNECTION_FAILED': 'Riconnessione in corso...',
      'PARTNERSHIP_NOT_FOUND': 'Controlla l\'ID partnership fornito',
      'REMINDER_CHECK_ERROR': 'Riprovando il controllo delle partnership...'
    };

    return autoFixes[code] || null;
  }

  /**
   * Registra l'errore nello storico
   */
  recordError(errorEntry) {
    this.errorHistory.push(errorEntry);
    
    // Mantieni solo gli ultimi N errori
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }
  }

  /**
   * Ottieni statistiche degli errori
   */
  getErrorStats() {
    return {
      totalErrors: this.errorHistory.length,
      errorsByCode: this.getErrorsByCode(),
      errorsBySeverity: this.getErrorsBySeverity(),
      recentErrors: this.errorHistory.slice(-10),
      patterns: Array.from(this.errorPatterns.values())
    };
  }

  /**
   * Raggruppa errori per codice
   */
  getErrorsByCode() {
    const grouped = {};
    for (const error of this.errorHistory) {
      grouped[error.code] = (grouped[error.code] || 0) + 1;
    }
    return grouped;
  }

  /**
   * Raggruppa errori per severità
   */
  getErrorsBySeverity() {
    return {
      CRITICAL: this.errorHistory.filter(e => e.severity === 'CRITICAL').length,
      HIGH: this.errorHistory.filter(e => e.severity === 'HIGH').length,
      MEDIUM: this.errorHistory.filter(e => e.severity === 'MEDIUM').length
    };
  }

  /**
   * Pulisci lo storico degli errori
   */
  clearHistory() {
    this.errorHistory = [];
    this.errorPatterns.clear();
  }
}

module.exports = new AIErrorHandler();
