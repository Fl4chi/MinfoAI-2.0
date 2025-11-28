// Partnership Schema
// Manages server partnerships with advanced features like ban sharing and cross-server integration

const mongoose = require('mongoose');

const partnershipSchema = new mongoose.Schema({
  partnershipId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Primary Partner Info
  primaryGuild: {
    guildId: { type: String, required: true },
    guildName: { type: String, required: true },
    serverName: { type: String, required: true },
    inviteLink: { type: String, required: true },
    description: { type: String, required: true },
    userId: { type: String, required: true },
    memberCount: { type: Number, default: 0 },
    iconUrl: { type: String, default: '' }
  },

  // Secondary Partner Info (Optional, for mutual partnerships)
  secondaryGuild: {
    guildId: String,
    guildName: String,
    serverName: String,
    inviteLink: String,
    description: String,
    userId: String
  },

  // Partnership Status
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'rejected', 'expired'],
    default: 'pending',
    index: true
  },

  // AI Analysis
  aiAnalysis: {
    userProfile: { type: Object }, // Legacy field
    credibilityScore: { type: Number, default: 50 },
    riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
    summary: { type: String, default: '' },
    recommendation: { type: String, default: 'MANUAL_REVIEW' },
    timestamp: { type: Date, default: Date.now }
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true, collection: 'partnerships' });

const Partnership = mongoose.model('Partnership', partnershipSchema);

module.exports = Partnership;
