const mongoose = require('mongoose');

const guildConfigSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true
  },
  guildName: {
    type: String,
    required: true
  },
  // Configuration Channels & Roles
  partnershipChannelId: {
    type: String,
    default: null
  },
  staffRoleId: {
    type: String,
    default: null
  },
  logChannelId: {
    type: String,
    default: null
  },
  // Server Profile for Auto-Partnership
  serverProfile: {
    description: { type: String, maxLength: 1000, default: null },
    inviteLink: { type: String, default: null }, // Must be infinite
    tags: [{ type: String }], // e.g., ['Gaming', 'Anime']
    memberCount: { type: Number, default: 0 },
    iconUrl: { type: String, default: null },
    lastPostDate: { type: Date, default: null } // When was the last time this server posted a partner?
  },
  // Economy System
  economy: {
    balance: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    // Tier System
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    },
    tierUnlockedAt: { type: Date, default: null },
    // Tier Objectives Tracking
    tierStats: {
      totalPartnerships: { type: Number, default: 0 },
      activePartnerships: { type: Number, default: 0 },
      rejectedLast15Days: { type: Number, default: 0 },
      rejectedLast30Days: { type: Number, default: 0 },
      rejectedLast60Days: { type: Number, default: 0 },
      silverUnlockedAt: { type: Date, default: null },
      goldUnlockedAt: { type: Date, default: null }
    },
    // Boost System
    boostActive: { type: Boolean, default: false },
    boostExpiresAt: { type: Date, default: null }
  },
  // Meta
  isConfigured: {
    type: Boolean,
    default: false
  },
  configuredAt: {
    type: Date,
    default: null
  },
  configuredBy: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GuildConfig', guildConfigSchema);
