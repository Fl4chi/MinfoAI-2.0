/**
 * Partnership Matcher Module
 * Sistema AI per il matching intelligente tra utenti e server partnership
 * Analizza profili e suggerisce le migliori partnership per ogni utente
 */

const AIConfig = require('./ai.config');
const userProfiler = require('./userProfiler');
const errorLogger = require('../logging/errorLogger');

class PartnershipMatcher {
  constructor() {
    this.config = AIConfig.partnershipMatcher;
    this.partnerServers = new Map(); // Cache dei server partner
    this.recommendations = new Map();
  }

  /**
   * Registra un server come partner
   */
  async registerPartnerServer(serverId, serverData) {
    try {
      const partner = {
        id: serverId,
        name: serverData.name,
        description: serverData.description || '',
        memberCount: serverData.memberCount || 0,
        category: serverData.category || 'community',
        language: serverData.language || 'it',
        icon: serverData.icon,
        region: serverData.region || 'EU',
        activityLevel: this.calculateActivityLevel(serverData),
        tags: serverData.tags || [],
        createdAt: new Date()
      };

      this.partnerServers.set(serverId, partner);
      errorLogger.log(`✅ Registered partner server: ${partner.name} (${serverId})`, 'AI_MATCHER');
      return partner;
    } catch (error) {
      errorLogger.error(`❌ Partner registration error`, error, AIConfig.errorCodes.MATCHER_ERROR);
      throw error;
    }
  }

  /**
   * Calcola il livello di attività di un server
   */
  calculateActivityLevel(serverData) {
    const memberCount = serverData.memberCount || 0;
    const messageRate = serverData.messageRate || 0;
    
    if (memberCount > 1000 && messageRate > 100) return 'very-high';
    if (memberCount > 500 && messageRate > 50) return 'high';
    if (memberCount > 100 && messageRate > 10) return 'medium';
    return 'low';
  }

  /**
   * Genera raccomandazioni per un utente
   * Principale AI function - analizza il profilo e suggerisc server partnership
   */
  async generateRecommendations(userId) {
    try {
      const userProfile = userProfiler.getProfile(userId);
      if (!userProfile) {
        errorLogger.log(`⚠️ No profile found for user ${userId}`, 'AI_MATCHER');
        return [];
      }

      const recommendations = [];
      const threshold = this.config.minCompatibilityThreshold;
      const maxRecs = this.config.recommendationsPerUser;

      // Analizza ogni server partner
      for (const [serverId, partnerServer] of this.partnerServers.entries()) {
        // Salta server dove l'utente è già membro
        if (userProfile.guilds.includes(serverId)) continue;

        // Calcola score di compatibilità
        const compatibilityScore = userProfiler.calculateCompatibility(userId, partnerServer);

        // Se sopra soglia, aggiungere alle raccomandazioni
        if (compatibilityScore >= threshold) {
          recommendations.push({
            serverId,
            serverName: partnerServer.name,
            compatibilityScore,
            reason: this.generateReason(userProfile, partnerServer, compatibilityScore),
            features: partnerServer.tags,
            memberCount: partnerServer.memberCount,
            language: partnerServer.language
          });
        }
      }

      // Ordina per score decrescente e prendi i top N
      const topRecommendations = recommendations
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, maxRecs);

      // Salva raccomandazioni in cache
      this.recommendations.set(userId, {
        recommendations: topRecommendations,
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 ore
      });

      errorLogger.log(`✅ Generated ${topRecommendations.length} recommendations for ${userId}`, 'AI_MATCHER');
      return topRecommendations;
    } catch (error) {
      errorLogger.error(`❌ Recommendation generation error`, error, AIConfig.errorCodes.MATCHER_ERROR);
      return [];
    }
  }

  /**
   * Genera spiegazione testuale per perché viene consigliato un server
   */
  generateReason(userProfile, partnerServer, score) {
    const reasons = [];

    // Analizza il profilo dell'utente
    if (userProfile.guildCount > 20) {
      reasons.push('Profilo attivo con molti server');
    }

    if (userProfile.interactionHistory.length > 50) {
      reasons.push('Utente molto interattivo');
    }

    // Analizza il server partner
    if (partnerServer.activityLevel === 'high' || partnerServer.activityLevel === 'very-high') {
      reasons.push(`Server molto attivo (${partnerServer.memberCount} membri)`);
    }

    if (partnerServer.language === 'it' || partnerServer.language === 'en') {
      reasons.push('Lingua compatibile');
    }

    if (score >= 80) {
      reasons.push('🔥 Match perfetto basato su AI');
    } else if (score >= 70) {
      reasons.push('Buon match con il tuo profilo');
    }

    return reasons.length > 0 
      ? reasons.join(' • ')
      : `Partnership score: ${score}%`;
  }

  /**
   * Ottiene raccomandazioni in cache per un utente
   */
  async getRecommendations(userId) {
    try {
      const cached = this.recommendations.get(userId);

      // Se cache valida, ritorna
      if (cached && cached.expiresAt > new Date()) {
        return cached.recommendations;
      }

      // Altrimenti genera nuove raccomandazioni
      return await this.generateRecommendations(userId);
    } catch (error) {
      errorLogger.error(`❌ Error getting recommendations`, error, AIConfig.errorCodes.MATCHER_ERROR);
      return [];
    }
  }

  /**
   * Ottiene tutti i server partner
   */
  getPartnerServers() {
    return Array.from(this.partnerServers.values());
  }

  /**
   * Rimuove un server dal matching
   */
  async removePartnerServer(serverId) {
    try {
      this.partnerServers.delete(serverId);
      errorLogger.log(`✅ Removed partner server: ${serverId}`, 'AI_MATCHER');
    } catch (error) {
      errorLogger.error(`❌ Error removing partner server`, error, AIConfig.errorCodes.MATCHER_ERROR);
    }
  }

  /**
   * Invalida cache raccomandazioni per un utente
   * (usato quando il profilo dell'utente cambia)
   */
  invalidateUserRecommendations(userId) {
    this.recommendations.delete(userId);
  }

  /**
   * Statistiche del sistema AI
   */
  getSystemStats() {
    return {
      totalPartnerServers: this.partnerServers.size,
      cachedRecommendations: this.recommendations.size,
      config: {
        minThreshold: this.config.minCompatibilityThreshold,
        maxRecommendationsPerUser: this.config.recommendationsPerUser,
        categories: this.config.partnerCategories
      }
    };
  }
}

module.exports = new PartnershipMatcher();
