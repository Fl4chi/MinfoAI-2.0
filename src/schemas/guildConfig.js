const mongoose = require('mongoose');

const guildConfigSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  guildName: {
    type: String,
    default: 'Unknown Guild',
  },
  // Partnership Settings
  partnershipChannelId: {
    type: String,
    required: true,
  },
  logChannelId: {
    type: String,
    required: true,
  },
  staffRoleId: {
    type: String,
    required: true,
  },
  // Colors for embeds
  embedColor: {
    type: String,
    default: '#5865F2',
  },
  successColor: {
    type: String,
    default: '#57F287',
  },
  errorColor: {
    type: String,
    default: '#ED4245',
  },
  // Setup Status
  setupComplete: {
    type: Boolean,
    default: false,
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-update updatedAt
guildConfigSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('GuildConfig', guildConfigSchema);
