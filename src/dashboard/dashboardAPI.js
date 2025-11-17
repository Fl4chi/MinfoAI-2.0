/**
 * Analytics Dashboard API
 * Endpoint per il dashboard con visualizzazione dati, grafici, trend
 * Mobile responsive e Discord OAuth integration
 */

const express = require('express');
const router = express.Router();
const analyticsEngine = require('../analytics/analyticsEngine');
const leaderboards = require('../analytics/leaderboards');
const healthMonitor = require('../analytics/healthMonitoring');
const logger = require('../logging/logger');

/**
 * GET /api/dashboard/overview
 * Ritorna overview generale delle partnership
 */
router.get('/overview', async (req, res) => {
  try {
    const allStats = await analyticsEngine.getAllStats();
    const overview = {
      totalPartnerships: allStats.length,
      activePartnerships: allStats.filter(s => s.health !== 'At Risk').length,
      avgPerformance: (allStats.reduce((sum, s) => sum + s.performanceScore, 0) / allStats.length).toFixed(1),
      topPerformer: allStats.sort((a, b) => b.performanceScore - a.performanceScore)[0],
      timestamp: new Date(),
    };
    res.json(overview);
  } catch (error) {
    logger.error('Error fetching overview', error);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

/**
 * GET /api/dashboard/leaderboard/:type
 * :type = performance, engagement, tier (gold/silver/bronze)
 */
router.get('/leaderboard/:type', async (req, res) => {
  try {
    let leaderboardData;
    switch (req.params.type) {
      case 'performance':
        leaderboardData = await leaderboards.getLeaderboard('performanceScore');
        break;
      case 'engagement':
        leaderboardData = await leaderboards.getEngagementLeaderboard();
        break;
      case 'monthly':
        leaderboardData = await leaderboards.getMonthlyWinners();
        break;
      default:
        return res.status(400).json({ error: 'Invalid type' });
    }
    res.json(leaderboardData);
  } catch (error) {
    logger.error('Error fetching leaderboard', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /api/dashboard/partnership/:id/stats
 * Statistiche dettagliate di una partnership
 */
router.get('/partnership/:id/stats', async (req, res) => {
  try {
    const stats = await analyticsEngine.getPartnershipStats(req.params.id);
    const trends = await analyticsEngine.getTrendData(req.params.id);
    res.json({ ...stats, trends });
  } catch (error) {
    logger.error('Error fetching partnership stats', error);
    res.status(500).json({ error: 'Partnership not found' });
  }
});

/**
 * GET /api/dashboard/health-alerts
 * Alert per partnership in difficoltà
 */
router.get('/health-alerts', async (req, res) => {
  try {
    const alerts = await healthMonitor.monitorAll();
    res.json({
      alerts,
      criticalCount: alerts.filter(a => a.type === 'CRITICAL').length,
      warningCount: alerts.filter(a => a.type === 'WARNING').length,
    });
  } catch (error) {
    logger.error('Error fetching health alerts', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

/**
 * GET /api/dashboard/stats
 * Statistiche globali e trend
 */
router.get('/stats', async (req, res) => {
  try {
    const allStats = await analyticsEngine.getAllStats();
    res.json({
      partnerships: allStats,
      summary: {
        total: allStats.length,
        excellent: allStats.filter(s => s.health === 'Excellent').length,
        good: allStats.filter(s => s.health === 'Good').length,
        fair: allStats.filter(s => s.health === 'Fair').length,
        atRisk: allStats.filter(s => s.health === 'At Risk').length,
      },
    });
  } catch (error) {
    logger.error('Error fetching stats', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
