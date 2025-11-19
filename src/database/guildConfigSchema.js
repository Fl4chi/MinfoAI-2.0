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
