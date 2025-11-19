/**
 * User Profiler Module
 * Raccoglie e gestisce i profili degli utenti per il sistema AI
 * Traccia: server membership, interazioni, preferenze partnership
 */

const mongoose = require('mongoose');
const AIConfig = require('./ai.config');
const errorLogger = require('../utils/errorLogger');

class UserProfiler {
  constructor() {
    this.config = AIConfig.userProfiler;
    this.profiles = new Map(); // Cache in memoria
  }

  /**
   * Crea o aggiorna il profilo di un utente
   * @param {Object} user - Discord user object
   * @param {Array} guilds - Guild IDs dove l'utente è membro
   */
  async createOrUpdateProfile(user, guilds = []) {
    try {
      const profile = {
        userId: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar,
        createdAt: new Date(),
        guilds: guilds || [],
        guildCount: guilds?.length || 0,
        roles: [],
        interactionHistory: [],
        preferredPartners: [],
        compatibilityScores: {},
        lastUpdated: new Date()
      };

      this.profiles.set(user.id, profile);
      errorLogger.logInfo(`✅ Created profile for user: ${user.username} (${user.id})`, 'AI_PROFILER');
      return profile;
    } catch (error) {
      errorLogger.logError('ERROR', `❌ Profile creation error for ${user.id}`, 'PROFILER_ERROR', error);
      throw error;
    }
  }

  /**
   * Registra un'interazione utente (comando usato, partnership view, etc)
   */
  async logInteraction(userId, interactionType, data = {}) {
    try {
      const profile = this.profiles.get(userId);
      if (!profile) return;

      profile.interactionHistory.push({
        type: interactionType,
        timestamp: new Date(),
        data
      });

      // Mantieni solo gli ultimi 100 eventi
      if (profile.interactionHistory.length > 100) {
        profile.interactionHistory.shift();
      }

      profile.lastUpdated = new Date();
    } catch (error) {
      errorLogger.logError('ERROR', `❌ Interaction logging error for ${userId}`, 'PROFILER_ERROR', error);
    }
  }

  /**
   * Ottiene il profilo di un utente
   */
  getProfile(userId) {
    return this.profiles.get(userId);
  }

  /**
   * Aggiorna la lista di server dell'utente
   */
  async updateUserGuilds(userId, guildIds) {
    try {
      const profile = this.profiles.get(userId);
      if (!profile) return;

      profile.guilds = guildIds || [];
      profile.guildCount = guildIds?.length || 0;
      profile.lastUpdated = new Date();

      errorLogger.logInfo(`✅ Updated guilds for ${userId}: ${guildIds.length} servers`, 'AI_PROFILER');
    } catch (error) {
      errorLogger.logError('ERROR', `❌ Guild update error for ${userId}`, 'PROFILER_ERROR', error);
    }
  }

  /**
   * Calcola score di compatibilità tra utente e server partner
   * @param {String} userId - ID utente
   * @param {Object} partnerServer - Server partner da analizzare
   */
  calculateCompatibility(userId, partnerServer) {
    try {
      const profile = this.profiles.get(userId);
      if (!profile) return 0;

      let score = 0;
      const weights = this.config.compatibilityWeights;

      // Guild Match (35%)
      const userGuildCount = profile.guildCount;
      const partnerMemberCount = partnerServer.memberCount || 0;
      const guildMatch = Math.min(userGuildCount / 20, 1) * 100;
      score += guildMatch * weights.guildMatch;

      // Role Match (25%)
      const hasCommonRoles = profile.roles.some(role =>
        partnerServer.roles?.includes(role)
      ) ? 100 : 50;
      score += hasCommonRoles * weights.roleMatch;

      // History Match (20%)
      const interactionFrequency = profile.interactionHistory.length;
      const historyMatch = Math.min(interactionFrequency / 50, 1) * 100;
      score += historyMatch * weights.historyMatch;

      // Typology Match (20%)
      const typologyMatch = this.matchServerType(profile, partnerServer) * 100;
      score += typologyMatch * weights.typologyMatch;

      // Score finale (0-100)
      const finalScore = Math.round(score / Object.values(weights).reduce((a, b) => a + b, 0));

      profile.compatibilityScores[partnerServer.id] = finalScore;
      return finalScore;
    } catch (error) {
      errorLogger.logError('ERROR', `❌ Compatibility calculation error`, 'PROFILER_ERROR', error);
      return 0;
    }
  }

  /**
   * Matching di tipologie di server
   */
  matchServerType(userProfile, serverProfile) {
    // Logica semplice: se l'utente interagisce frequentemente, più probabilità
    if (userProfile.interactionHistory.length > 30) return 0.9;
    if (userProfile.interactionHistory.length > 10) return 0.7;
    return 0.5;
  }

  /**
   * Ottiene tutti i profili attivi
   */
  getAllProfiles() {
    return Array.from(this.profiles.values());
  }

  /**
   * Pulisce cache (da eseguire periodicamente)
   */
  async cleanupCache() {
    try {
      let removedCount = 0;
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      for (const [userId, profile] of this.profiles.entries()) {
        if (profile.lastUpdated < thirtyDaysAgo) {
          this.profiles.delete(userId);
          removedCount++;
        }
      }

      errorLogger.logInfo(`✅ Cache cleanup: removed ${removedCount} old profiles`, 'AI_PROFILER');
    } catch (error) {
      errorLogger.logError('ERROR', `❌ Cache cleanup error`, 'PROFILER_ERROR', error);
    }
  }
}

module.exports = new UserProfiler();
