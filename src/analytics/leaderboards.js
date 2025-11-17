/**
 * Partnership Leaderboards
 * Classifica partnership per tier, engagement, rating
 */

const Partnership = require('../database/models/partnershipSchema');
const analyticsEngine = require('./analyticsEngine');
const logger = require('../logging/logger');

class Leaderboards {
  async getLeaderboard(type = 'performance', limit = 10) {
    try {
      const partnerships = await Partnership.find().sort({ [type]: -1 }).limit(limit);
      const leaderboard = await Promise.all(
        partnerships.map((p, idx) => this.formatLeaderboardEntry(p, idx + 1))
      );
      
      logger.analytics('leaderboard_retrieved', null, { type, count: leaderboard.length });
      return leaderboard;
    } catch (error) {
      logger.error('Error getting leaderboard', error);
      throw error;
    }
  }

  async formatLeaderboardEntry(partnership, rank) {
    const stats = await analyticsEngine.getPartnershipStats(partnership._id);
    return {
      rank,
      name: partnership.name,
      tier: partnership.tier,
      rating: stats.rating,
      performance: stats.performanceScore.toFixed(1),
      engagement: stats.engagement.toFixed(1),
      health: stats.health,
      duration: stats.duration,
    };
  }

  async getByTier(tier, limit = 10) {
    try {
      const partnerships = await Partnership.find({ tier }).sort({ rating: -1 }).limit(limit);
      return Promise.all(partnerships.map((p, idx) => this.formatLeaderboardEntry(p, idx + 1)));
    } catch (error) {
      logger.error('Error getting tier leaderboard', error);
      throw error;
    }
  }

  async getEngagementLeaderboard(limit = 10) {
    try {
      const partnerships = await Partnership.find().sort({ interactions: -1 }).limit(limit);
      return Promise.all(partnerships.map((p, idx) => this.formatLeaderboardEntry(p, idx + 1)));
    } catch (error) {
      logger.error('Error getting engagement leaderboard', error);
      throw error;
    }
  }

  async getMonthlyWinners() {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    try {
      const topPerformers = await Partnership.find({
        updatedAt: { $gte: monthAgo },
      }).sort({ rating: -1 }).limit(5);

      return Promise.all(topPerformers.map((p, idx) => this.formatLeaderboardEntry(p, idx + 1)));
    } catch (error) {
      logger.error('Error getting monthly winners', error);
      throw error;
    }
  }
}

module.exports = new Leaderboards();
