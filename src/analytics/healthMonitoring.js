/**
 * Partnership Health Monitoring System
 * Monitorizza lo stato delle partnership e invia alerts quando in difficoltà
 */

const Partnership = require('../database/models/partnershipSchema');
const logger = require('../logging/logger');
const analyticsEngine = require('./analyticsEngine');

class HealthMonitor {
  constructor() {
    this.alerts = [];
    this.thresholds = {
      performanceRed: 30,
      performanceYellow: 50,
      inactivityDays: 14,
      rejectionRate: 0.5,
    };
  }

  async monitorAll() {
    try {
      const partnerships = await Partnership.find();
      const alerts = [];

      for (const partnership of partnerships) {
        const health = await this.checkHealth(partnership);
        if (health.alerts.length > 0) {
          alerts.push(...health.alerts);
        }
      }

      logger.info('Health monitoring completed', { alertsCount: alerts.length });
      return alerts;
    } catch (error) {
      logger.error('Error monitoring health', error);
      throw error;
    }
  }

  async checkHealth(partnership) {
    const alerts = [];
    const stats = await analyticsEngine.getPartnershipStats(partnership._id);

    // Performance check
    if (stats.performanceScore < this.thresholds.performanceRed) {
      alerts.push({
        type: 'CRITICAL',
        partnerId: partnership._id,
        message: `Partnership ${partnership.name} ha prestazioni critiche (${stats.performanceScore.toFixed(1)}%)`,
        timestamp: new Date(),
      });
    } else if (stats.performanceScore < this.thresholds.performanceYellow) {
      alerts.push({
        type: 'WARNING',
        partnerId: partnership._id,
        message: `Partnership ${partnership.name} ha prestazioni ridotte`,
        timestamp: new Date(),
      });
    }

    // Inactivity check
    const inactiveDays = this.getInactiveDays(partnership);
    if (inactiveDays > this.thresholds.inactivityDays) {
      alerts.push({
        type: 'INFO',
        partnerId: partnership._id,
        message: `Partnership ${partnership.name} inattiva da ${inactiveDays} giorni`,
        timestamp: new Date(),
      });
    }

    // Rejection rate check
    const rejectionRate = partnership.rejections / (partnership.approvals + partnership.rejections + 1);
    if (rejectionRate > this.thresholds.rejectionRate) {
      alerts.push({
        type: 'WARNING',
        partnerId: partnership._id,
        message: `Partnership ${partnership.name} ha alto tasso di rifiuti (${(rejectionRate * 100).toFixed(1)}%)`,
        timestamp: new Date(),
      });
    }

    return { alerts, health: stats.health };
  }

  getInactiveDays(partnership) {
    if (!partnership.lastActivity) return 999;
    const lastActive = new Date(partnership.lastActivity);
    const today = new Date();
    return Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
  }

  async sendAlert(alert, client) {
    try {
      const guild = client.guilds.cache.first();
      if (!guild) return;

      const adminRole = guild.roles.cache.find(r => r.name.toLowerCase() === 'admin');
      const adminUsers = adminRole?.members.map(m => m.user);

      for (const admin of adminUsers || []) {
        await admin.send({
          content: `🚨 **${alert.type}** - ${alert.message}`,
        }).catch(err => logger.warn('Could not send alert', { adminId: admin.id }));
      }

      logger.partnership('alert_sent', alert.partnerId, { alertType: alert.type });
    } catch (error) {
      logger.error('Error sending alert', error);
    }
  }
}

module.exports = new HealthMonitor();
