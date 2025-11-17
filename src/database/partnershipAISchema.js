const mongoose = require('mongoose');

const partnershipAISchema = new mongoose.Schema({
  partnershipId: { type: String, required: true, unique: true },
  
  // Tier system - Auto-calculated by AI
  tier: {
    level: { type: String, enum: ['bronze', 'silver', 'gold'], default: 'bronze' },
    earnedAt: { type: Date },
    upgradeNextCheck: { type: Date, default: () => new Date(Date.now() + 7*24*60*60*1000) } // Weekly check
  },
  
  // Partnership health metrics
  health: {
    engagementScore: { type: Number, min: 0, max: 100, default: 50 },
    activityRate: { type: Number, min: 0, max: 100, default: 50 },
    retentionProbability: { type: Number, min: 0, max: 100, default: 50 },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // AI Insights
  aiInsights: {
    recommendations: [{ type: String }],
    risks: [{ type: String }],
    nextBestAction: { type: String },
    predictedSuccessRate: { type: Number, min: 0, max: 100 },
    generatedAt: { type: Date, default: Date.now }
  },
  
  // Auto-renewal settings
  autoRenewal: {
    enabled: { type: Boolean, default: false },
    lastRenewalDate: { type: Date },
    nextRenewalDate: { type: Date },
    renewalHistory: [{
      date: Date,
      success: Boolean,
      reason: String
    }]
  },
  
  // Feedback & Rating system
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comments: { type: String },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
    createdAt: { type: Date, default: Date.now }
  },
  
  // Matching compatibility data
  matchingProfile: {
    serverSize: { type: String },
    language: { type: String },
    serverType: { type: String },
    activityLevel: { type: String },
    communityVibe: { type: String },
    compatibleServers: [{
      partnerId: String,
      compatibilityScore: Number
    }]
  },
  
  // Performance tracking
  performance: {
    monthlyEngagement: [{
      month: String,
      engagement: Number
    }],
    memberGrowth: [{
      date: Date,
      count: Number
    }],
    crossPromotionCount: { type: Number, default: 0 }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('PartnershipAI', partnershipAISchema);
