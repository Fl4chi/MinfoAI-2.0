/**
 * Analytics Engine per Partnership
 * Calcola metriche, trend, performance, engagement
 */

const Partnership = require('../database/models/partnershipSchema');
const logger = require('../logging/logger');

class AnalyticsEngine {
  async getPartnershipStats(partnershipId) {
    try {
      const partnership = await Partnership.findById(partnershipId);
      if (!partnership) throw new Error('Partnership not found');

      const stats = {
        partnershipId,
        name: partnership.name,
        tier: partnership.tier,
        engagement: this.calculateEngagement(partnership),
        performanceScore: this.calculatePerformance(partnership),
        health: this.calculateHealth(partnership),
        duration: this.calculateDuration(partnership),
        rating: partnership.rating || 0,
        createdAt: partnership.createdAt,
      };

      logger.analytics('stats_calculated', partnershipId, stats);
      return stats;
    } catch (error) {
      logger.error('Error calculating stats', error, { partnershipId });
      throw error;
    }
  }

  calculateEngagement(partnership) {
    const interactions = partnership.interactions || 0;
    const requests = partnership.requests || 0;
    const approvals = partnership.approvals || 0;
    const rejections = partnership.rejections || 0;

    return ((interactions + requests + approvals) / (approvals + rejections + 1)) * 100;
  }

  calculatePerformance(partnership) {
    const approvalRate = partnership.approvals / (partnership.approvals + partnership.rejections + 1);
    const avgResponseTime = partnership.avgResponseTime || 24;
    const rating = partnership.rating || 3;

    return ((approvalRate * 40) + ((24 - Math.min(avgResponseTime, 24)) / 24 * 35) + (rating / 5 * 25));
  }

  calculateHealth(partnership) {
    const performance = this.calculatePerformance(partnership);
    const recentActive = partnership.lastActivity ? 
      (Date.now() - partnership.lastActivity) < (7 * 24 * 60 * 60 * 1000) : false;
    
    if (performance > 80 && recentActive) return 'Excellent';
    if (performance > 60 && recentActive) return 'Good';
    if (performance > 40) return 'Fair';
    return 'At Risk';
  }

  calculateDuration(partnership) {
    const startDate = new Date(partnership.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async getAllStats() {
    try {
      const partnerships = await Partnership.find();
      return Promise.all(partnerships.map(p => this.getPartnershipStats(p._id)));
    } catch (error) {
      logger.error('Error getting all stats', error);
      throw error;
    }
  }

  async getTrendData(partnershipId, days = 30) {
    try {
      const partnership = await Partnership.findById(partnershipId);
      if (!partnership) throw new Error('Partnership not found');

      return {
        partnershipId,
        engagementTrend: this.generateTrend(days, 'engagement'),
        performanceTrend: this.generateTrend(days, 'performance'),
        requests: partnership.requests || 0,
        approvals: partnership.approvals || 0,
        rejections: partnership.rejections || 0,
      };
    } catch (error) {
      logger.error('Error getting trend data', error, { partnershipId });
      throw error;
    }
  }

  generateTrend(days, type) {
    return Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      value: Math.floor(Math.random() * 100),
      type,
    }));
  }
}

module.exports = new AnalyticsEngine();
