const mongoose = require('mongoose');

const pendingRewardSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    guildId: {
        type: String,
        required: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    rewardUnlockDate: {
        type: Date,
        required: true // joinedAt + 10 days
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'], // FAILED if user leaves before 10 days
        default: 'PENDING'
    },
    sourcePartnerId: {
        type: String, // ID of the partnership message/server that led to this join (optional, for advanced tracking)
        default: null
    }
}, {
    timestamps: true
});

// Index for fast lookups by user and guild
pendingRewardSchema.index({ userId: 1, guildId: 1 });

module.exports = mongoose.model('PendingReward', pendingRewardSchema);
