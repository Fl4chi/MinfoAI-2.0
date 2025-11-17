/**
 * Database Optimization & Maintenance
 * Query optimization, indexing, backup automation
 */

const mongoose = require('mongoose');
const logger = require('../logging/logger');
const fs = require('fs');
const path = require('path');

class DatabaseOptimization {
  /**
   * Crea indici ottimali per le query più comuni
   */
  async createOptimalIndexes() {
    try {
      const Partnership = mongoose.model('Partnership');
      
      // Indici per query comuni
      await Partnership.collection.createIndex({ tier: 1 });
      await Partnership.collection.createIndex({ status: 1 });
      await Partnership.collection.createIndex({ rating: -1 });
      await Partnership.collection.createIndex({ createdAt: -1 });
      await Partnership.collection.createIndex({ guildId: 1, leaderId: 1 });
      
      logger.info('Database indexes created successfully');
    } catch (error) {
      logger.error('Error creating indexes', error);
    }
  }

  /**
   * Analizza e ottimizza query lente
   */
  async analyzeSlowQueries() {
    try {
      const db = mongoose.connection.db;
      const slowQueryLog = await db.collection('system.profile').find({
        millis: { $gt: 1000 },
      }).toArray();

      logger.info('Slow queries analysis', { count: slowQueryLog.length });
      return slowQueryLog;
    } catch (error) {
      logger.error('Error analyzing queries', error);
    }
  }

  /**
   * Backup automatico del database
   */
  async performBackup() {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const backupDir = path.join(process.cwd(), 'backups', timestamp);

      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      logger.info('Database backup started', { timestamp });
      // In un environment reale, usare mongodump o simile
      
      return { success: true, timestamp, backupDir };
    } catch (error) {
      logger.error('Error performing backup', error);
      throw error;
    }
  }

  /**
   * Ripulisce vecchi record e ottimizza storage
   */
  async cleanupOldData(daysOld = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const Partnership = mongoose.model('Partnership');
      const result = await Partnership.deleteMany({
        status: 'inactive',
        updatedAt: { $lt: cutoffDate },
      });

      logger.info('Old data cleanup completed', { deletedCount: result.deletedCount });
      return result;
    } catch (error) {
      logger.error('Error cleaning up data', error);
    }
  }

  /**
   * Monitora salute del database
   */
  async healthCheck() {
    try {
      const db = mongoose.connection.db;
      const stats = await db.collection('partnerships').stats();

      return {
        connected: mongoose.connection.readyState === 1,
        collections: stats.ns,
        size: stats.size,
        avgDocSize: stats.avgObjSize,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Database health check failed', error);
      return { connected: false, error: error.message };
    }
  }

  /**
   * Ottimizza collection con compattazione
   */
  async compactCollection() {
    try {
      const db = mongoose.connection.db;
      // Comando di compattazione MongoDB
      await db.admin().command({ compact: 'partnerships' });
      
      logger.info('Collection compaction completed');
    } catch (error) {
      logger.warn('Collection compaction not available or failed', error);
    }
  }
}

module.exports = new DatabaseOptimization();
