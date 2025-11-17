/**
 * Weekly AI Newsletter System
 * Invia report settimanali agli admin sullo stato delle partnership
 */

const Partnership = require('../database/models/partnershipSchema');
const analyticsEngine = require('./analyticsEngine');
const logger = require('../logging/logger');

class Newsletter {
  async generateWeeklyReport() {
    try {
      const stats = await analyticsEngine.getAllStats();
      const partnerships = await Partnership.find();

      const report = {
        week: new Date().toISOString().split('T')[0],
        totalPartnerships: partnerships.length,
        activePartnerships: partnerships.filter(p => p.status === 'active').length,
        totalRequests: partnerships.reduce((sum, p) => sum + (p.requests || 0), 0),
        totalApprovals: partnerships.reduce((sum, p) => sum + (p.approvals || 0), 0),
        avgPerformance: (stats.reduce((sum, s) => sum + s.performanceScore, 0) / stats.length).toFixed(1),
        topPerformers: stats.sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 5),
        atRiskPartnerships: stats.filter(s => s.health === 'At Risk'),
      };

      logger.analytics('weekly_report_generated', null, report);
      return report;
    } catch (error) {
      logger.error('Error generating weekly report', error);
      throw error;
    }
  }

  formatReportForDiscord(report) {
    return `
📊 **Weekly Partnership Report**

🔢 Statistics:
  • Total Partnerships: ${report.totalPartnerships}
  • Active: ${report.activePartnerships}
  • Avg Performance: ${report.avgPerformance}%

📈 Activity:
  • Total Requests: ${report.totalRequests}
  • Approvals: ${report.totalApprovals}

⭐ Top Performers:
${report.topPerformers.map((p, i) => `  ${i + 1}. ${p.name} (${p.performanceScore.toFixed(1)}%)`).join('\n')}

⚠️ At Risk: ${report.atRiskPartnerships.length} partnerships
    `;
  }

  async sendWeeklyNewsletter(client) {
    try {
      const report = await this.generateWeeklyReport();
      const message = this.formatReportForDiscord(report);

      const guild = client.guilds.cache.first();
      const adminRole = guild?.roles.cache.find(r => r.name.toLowerCase() === 'admin');
      const adminUsers = adminRole?.members.map(m => m.user) || [];

      for (const admin of adminUsers) {
        await admin.send({ content: message }).catch(err => 
          logger.warn('Could not send newsletter', { adminId: admin.id })
        );
      }

      logger.info('Weekly newsletter sent', { adminCount: adminUsers.length });
    } catch (error) {
      logger.error('Error sending newsletter', error);
    }
  }
}

module.exports = new Newsletter();
