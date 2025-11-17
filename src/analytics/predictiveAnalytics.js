/**
 * Predictive Analytics using AI
 * Predice successo di future partnership basato su dati storici
 */

const Partnership = require('../database/models/partnershipSchema');
const logger = require('../logging/logger');

class PredictiveAnalytics {
  /**
   * Predice il successo di una partnership basato su:
   * - Tier della partnership
   * - Performance storica di partnership simili
   * - Trend attuali
   */
  async predictSuccess(partnershipData) {
    try {
      const historicalData = await this.getHistoricalData(partnershipData.tier);
      const prediction = this.calculatePrediction(partnershipData, historicalData);
      
      logger.analytics('prediction_calculated', null, prediction);
      return prediction;
    } catch (error) {
      logger.error('Error predicting success', error);
      throw error;
    }
  }

  async getHistoricalData(tier) {
    try {
      const partnerships = await Partnership.find({ tier });
      return {
        avgPerformance: this.calculateAvg(partnerships.map(p => p.rating || 0)),
        avgEngagement: this.calculateAvg(partnerships.map(p => p.interactions || 0)),
        successRate: partnerships.filter(p => p.status === 'active').length / partnerships.length,
      };
    } catch (error) {
      logger.error('Error getting historical data', error);
      return {};
    }
  }

  calculatePrediction(newData, historical) {
    const baseScore = historical.successRate * 100 || 50;
    const tierBonus = { gold: 20, silver: 10, bronze: 0 }[newData.tier] || 0;
    const performanceBonus = (newData.initialRating || 3) * 10;
    
    const successProbability = Math.min(100, baseScore + tierBonus + performanceBonus / 2);
    
    return {
      successProbability: Math.round(successProbability),
      recommendation: this.getRecommendation(successProbability),
      timestamp: new Date(),
    };
  }

  getRecommendation(probability) {
    if (probability > 80) return 'HIGHLY_RECOMMENDED';
    if (probability > 60) return 'RECOMMENDED';
    if (probability > 40) return 'PROCEED_WITH_CAUTION';
    return 'NOT_RECOMMENDED';
  }

  calculateAvg(values) {
    return values.length > 0 ? values.reduce((a, b) => a + b) / values.length : 0;
  }

  async predictChurn(partnershipId) {
    try {
      const partnership = await Partnership.findById(partnershipId);
      if (!partnership) throw new Error('Partnership not found');

      const riskFactors = this.calculateChurnRisk(partnership);
      return {
        churnRisk: Math.min(100, riskFactors.total),
        factors: riskFactors,
        recommendation: riskFactors.total > 60 ? 'INTERVENTION_NEEDED' : 'MONITOR',
      };
    } catch (error) {
      logger.error('Error predicting churn', error);
      throw error;
    }
  }

  calculateChurnRisk(partnership) {
    const inactiveDays = partnership.lastActivity ? 
      (Date.now() - partnership.lastActivity) / (1000 * 60 * 60 * 24) : 30;
    
    return {
      inactivityRisk: Math.min(100, inactiveDays * 2),
      performanceRisk: Math.max(0, (50 - (partnership.rating || 3) * 10)),
      rejectionRisk: (partnership.rejections / (partnership.approvals + partnership.rejections + 1)) * 100,
      total: (inactiveDays * 2 + (50 - (partnership.rating || 3) * 10) + 
              (partnership.rejections / (partnership.approvals + partnership.rejections + 1)) * 100) / 3,
    };
  }
}

module.exports = new PredictiveAnalytics();
