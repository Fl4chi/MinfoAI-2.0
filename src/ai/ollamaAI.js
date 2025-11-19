/**
 * Ollama AI Integration Module
 * Integra LLaMA 2 (open-source) per analisi intelligente del profilo utente
 * Nessuna API pagata, funziona localmente
 * SETUP RICHIESTO:
 * 1. Scaricare Ollama: https://ollama.ai
 * 2. Eseguire: ollama pull llama2
 * 3. Avviare: ollama serve
 * 4. Bot si connette a localhost:11434
 */

// const fetch = require('node-fetch'); // Native fetch used in Node 18+
const errorLogger = require('../utils/errorLogger');

class OllamaAI {
  constructor() {
    this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.model = 'llama2';
    this.isConnected = false;
    this.checkConnection();
  }

  /**
   * Verifica se Ollama è raggiungibile
   */
  async checkConnection() {
    try {
      const response = await fetch(`${this.ollamaHost}/api/tags`, { timeout: 5000 });
      if (response.ok) {
        this.isConnected = true;
        errorLogger.logInfo(`✅ Ollama AI connesso su ${this.ollamaHost}`, 'OLLAMA');
      }
    } catch (error) {
      this.isConnected = false;
      errorLogger.logWarn(`⚠️ Ollama non raggiungibile - Modalità fallback attiva`, 'OLLAMA');
    }
  }

  /**
   * Analizza il profilo utente e genera insights
   * @param {Object} userProfile - Profilo completo dell'utente
   * @returns {string} Analisi dell'utente
   */
  async analyzeUserProfile(userProfile) {
    try {
      if (!this.isConnected) {
        return this.generateFallbackAnalysis(userProfile);
      }

      const prompt = this.buildProfilePrompt(userProfile);
      const response = await fetch(`${this.ollamaHost}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          temperature: 0.7,
          num_predict: 200
        })
      });

      if (!response.ok) throw new Error('Ollama API error');
      const data = await response.json();
      return this.cleanAnalysis(data.response);
    } catch (error) {
      errorLogger.logError('ERROR', `❌ Errore nell'analisi Ollama`, 'OLLAMA_ERROR', error);
      return this.generateFallbackAnalysis(userProfile);
    }
  }

  /**
   * Genera raccomandazioni partnership basate su AI
   */
  async generatePartnershipRecommendationReason(userProfile, serverProfile) {
    try {
      if (!this.isConnected) {
        return this.generateFallbackReason(userProfile, serverProfile);
      }

      const prompt = `Analizza brevemente perche' questo utente potrebbe apprezzare questo server.

Utente: ${userProfile.username}
- Server membership: ${userProfile.guildCount}
- Attivita': ${userProfile.interactionHistory.length} interazioni
- Coins: ${userProfile.coins || 0}
- Partnership completate: ${userProfile.partnershipsCompleted || 0}

Server partner: ${serverProfile.name}
- Membri: ${serverProfile.memberCount}
- Tipo: ${serverProfile.category}
- Linguaggio: ${serverProfile.language}

Da' una spiegazione di 1-2 righe, massimo 100 caratteri, semplice e diretta.`;

      const response = await fetch(`${this.ollamaHost}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          temperature: 0.6,
          num_predict: 50
        })
      });

      if (!response.ok) throw new Error('Ollama API error');
      const data = await response.json();
      return this.cleanAnalysis(data.response).substring(0, 100);
    } catch (error) {
      return this.generateFallbackReason(userProfile, serverProfile);
    }
  }

  /**
   * Costruisce il prompt per l'analisi del profilo
   */
  buildProfilePrompt(profile) {
    return `Analizza brevemente questo profilo Discord in 2-3 righe:

Utente: ${profile.username}
- Nel server da: ${profile.joinDate}
- Messaggi inviati: ${profile.totalMessages || 0}
- Canali preferiti: ${profile.topChannels?.slice(0, 3).join(', ') || 'N/A'}
- Ore piu' attivo: ${profile.mostActiveHours?.slice(0, 3).join(',') || 'N/A'}
- Coins: ${profile.coins || 0}
- Partnership completate: ${profile.partnershipsCompleted || 0}
- Reputazione: ${profile.reputation || 0}★
- Interazioni: ${profile.interactionHistory?.length || 0}

Da' un profilo riassuntivo semplice e diretto.`;
  }

  /**
   * Fallback quando Ollama non è disponibile
   */
  generateFallbackAnalysis(profile) {
    if (profile.totalMessages > 500 && profile.coins > 1000) {
      return `⭐ ${profile.username} - Membro molto attivo e fidato`;
    } else if (profile.totalMessages > 200) {
      return `👋 ${profile.username} - Membro attivo del server`;
    } else if (profile.totalMessages > 50) {
      return `🔍 ${profile.username} - Membro nuovo, ancora poco attivo`;
    }
    return `❓ ${profile.username} - Profilo minimo`;
  }

  /**
   * Fallback per raccomandazioni
   */
  generateFallbackReason(userProfile, serverProfile) {
    if (userProfile.guildCount > 20) {
      return `Sei molto attivo, perfetto per ${serverProfile.name}`;
    }
    return `Match con ${serverProfile.name} basato su compatibilita'`;
  }

  /**
   * Pulisce la risposta di Ollama
   */
  cleanAnalysis(text) {
    return text
      .trim()
      .replace(/^\s+/, '')
      .replace(/\s+$/, '')
      .split('\n')[0]
      .substring(0, 150);
  }

  /**
   * Status Ollama
   */
  getStatus() {
    return {
      connected: this.isConnected,
      host: this.ollamaHost,
      model: this.model,
      status: this.isConnected ? '✅ Online' : '❌ Offline (fallback attivo)'
    };
  }
}

module.exports = new OllamaAI();
