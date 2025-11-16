/**
 * Staff Assistant Module
 * Fornisce ai gestori del server dati e insights dagli utenti
 * Aiuta a rivedere richieste partnership e analytics
 */

const AIConfig = require('./ai.config');
const userProfiler = require('./userProfiler');
const partnershipMatcher = require('./partnershipMatcher');
const errorLogger = require('../logging/errorLogger');

class StaffAssistant {
  constructor() {
    this.config = AIConfig.staffAssistant;
    this.pendingRequests = new Map();
    this.approvedPartners = new Map();
    this.analytics = {};
  }

  /**
   * Ottiene il profilo di un utente (vista staff - dati non sensibili)
   */
  getStaffUserProfile(userId) {
    try {
      const fullProfile = userProfiler.getProfile(userId);
      if (!fullProfile) return null;

      const viewableData = this.config.staffViewableData;
      const staffProfile = {};

      // Filtra solo i dati che lo staff può visualizzare
      for (const key of viewableData) {
        if (key === 'guildCount') {
          staffProfile.guildCount = fullProfile.guildCount;
        } else if (key === 'userId') {
          staffProfile.userId = fullProfile.userId;
        } else if (key === 'username') {
          staffProfile.username = fullProfile.username;
        } else if (key === 'compatibilityScore') {
          staffProfile.compatibilityScore = Object.values(fullProfile.compatibilityScores).reduce((a, b) => a + b, 0) / Object.keys(fullProfile.compatibilityScores).length || 0;
        } else if (key === 'recommendedPartners') {
          staffProfile.recommendedPartners = fullProfile.preferredPartners || [];
        }
      }

      return staffProfile;
    } catch (error) {
      errorLogger.error(`❌ Staff profile retrieval error for ${userId}`, error, AIConfig.errorCodes.STAFF_ERROR);
      return null;
    }
  }

  /**
   * Aggiunge una richiesta di partnership in pending review
   */
  async addPendingRequest(userId, serverId, requestData = {}) {
    try {
      const requestId = `${userId}-${serverId}-${Date.now()}`;
      
      const request = {
        id: requestId,
        userId,
        serverId,
        username: requestData.username || 'Unknown',
        status: 'pending',
        createdAt: new Date(),
        reason: requestData.reason || 'Partnership request',
        priority: 'normal'
      };

      this.pendingRequests.set(requestId, request);
      errorLogger.log(`✅ Added pending partnership request: ${requestId}`, 'STAFF_ASSISTANT');
      return request;
    } catch (error) {
      errorLogger.error(`❌ Error adding pending request`, error, AIConfig.errorCodes.STAFF_ERROR);
      throw error;
    }
  }

  /**
   * Ottiene tutte le richieste in pending
   */
  getPendingRequests() {
    const requests = Array.from(this.pendingRequests.values());
    return requests.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Approva una richiesta di partnership
   */
  async approvePendingRequest(requestId, staffNotes = '') {
    try {
      const request = this.pendingRequests.get(requestId);
      if (!request) throw new Error('Request not found');

      request.status = 'approved';
      request.approvedAt = new Date();
      request.staffNotes = staffNotes;

      // Sposta da pending ad approved
      this.pendingRequests.delete(requestId);
      this.approvedPartners.set(requestId, request);

      errorLogger.log(`✅ Approved partnership request: ${requestId}`, 'STAFF_ASSISTANT');
      return request;
    } catch (error) {
      errorLogger.error(`❌ Error approving request`, error, AIConfig.errorCodes.STAFF_ERROR);
      throw error;
    }
  }

  /**
   * Rifiuta una richiesta di partnership
   */
  async rejectPendingRequest(requestId, reason = '') {
    try {
      const request = this.pendingRequests.get(requestId);
      if (!request) throw new Error('Request not found');

      request.status = 'rejected';
      request.rejectedAt = new Date();
      request.rejectionReason = reason;

      this.pendingRequests.delete(requestId);

      errorLogger.log(`✅ Rejected partnership request: ${requestId}`, 'STAFF_ASSISTANT');
      return request;
    } catch (error) {
      errorLogger.error(`❌ Error rejecting request`, error, AIConfig.errorCodes.STAFF_ERROR);
      throw error;
    }
  }

  /**
   * Genera un report di analytics sui partnership
   */
  async generateAnalyticsReport() {
    try {
      const allProfiles = userProfiler.getAllProfiles();
      const partnerServers = partnershipMatcher.getPartnerServers();
      const stats = partnershipMatcher.getSystemStats();

      const report = {
        generatedAt: new Date(),
        totalUsers: allProfiles.length,
        totalPartnerServers: stats.totalPartnerServers,
        averageCompatibilityScore: this.calculateAverageCompatibility(allProfiles),
        activePendingRequests: this.pendingRequests.size,
        approvedPartnerships: this.approvedPartners.size,
        userEngagement: this.calculateEngagementMetrics(allProfiles),
        recommendations: {
          cached: stats.cachedRecommendations,
          maxPerUser: stats.config.maxRecommendationsPerUser
        }
      };

      this.analytics = report;
      errorLogger.log(`✅ Generated analytics report`, 'STAFF_ASSISTANT');
      return report;
    } catch (error) {
      errorLogger.error(`❌ Error generating analytics`, error, AIConfig.errorCodes.STAFF_ERROR);
      return null;
    }
  }

  /**
   * Calcola il voto di compatibilità medio
   */
  calculateAverageCompatibility(profiles) {
    if (profiles.length === 0) return 0;
    
    const sum = profiles.reduce((acc, profile) => {
      const scores = Object.values(profile.compatibilityScores);
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      return acc + avg;
    }, 0);

    return Math.round(sum / profiles.length * 100) / 100;
  }

  /**
   * Calcola metriche di engagement utenti
   */
  calculateEngagementMetrics(profiles) {
    const highEngagement = profiles.filter(p => p.interactionHistory.length > 50).length;
    const mediumEngagement = profiles.filter(p => p.interactionHistory.length > 20 && p.interactionHistory.length <= 50).length;
    const lowEngagement = profiles.filter(p => p.interactionHistory.length <= 20).length;

    return {
      high: highEngagement,
      medium: mediumEngagement,
      low: lowEngagement,
      totalActive: highEngagement + mediumEngagement + lowEngagement
    };
  }

  /**
   * Ottiene l'ultimo report di analytics
   */
  getAnalyticsReport() {
    return this.analytics;
  }

  /**
   * Invia reminders per richieste pending (gestito periodicamente dal bot)
   */
  async sendPendingRequestsReminder() {
    try {
      const pending = this.getPendingRequests();
      if (pending.length === 0) return null;

      const reminder = {
        title: `🔔 Reminder Partnership Requests`,
        description: `Hai ${pending.length} richieste di partnership in attesa di revisione`,
        requests: pending.slice(0, 5),
        totalPending: pending.length,
        timestamp: new Date()
      };

      errorLogger.log(`✅ Sent pending requests reminder to staff`, 'STAFF_ASSISTANT');
      return reminder;
    } catch (error) {
      errorLogger.error(`❌ Error sending reminder`, error, AIConfig.errorCodes.STAFF_ERROR);
      return null;
    }
  }

  /**
   * Ottiene la dashboard del staff (riepilogo completo)
   */
  async getStaffDashboard() {
    try {
      await this.generateAnalyticsReport();

      return {
        overview: this.analytics,
        pendingRequests: this.getPendingRequests(),
        recentApprovals: Array.from(this.approvedPartners.values()).slice(-5),
        permissions: this.config.staffPrivileges,
        timestamp: new Date()
      };
    } catch (error) {
      errorLogger.error(`❌ Error getting staff dashboard`, error, AIConfig.errorCodes.STAFF_ERROR);
      return null;
    }
  }
}

module.exports = new StaffAssistant();
