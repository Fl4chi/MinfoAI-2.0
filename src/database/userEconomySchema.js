const mongoose = require('mongoose');

const userEconomySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    totalEarned: {
        type: Number,
        default: 0
    },
    // Transaction History for transparency
    transactions: [{
        type: { type: String, enum: ['EARN', 'SPEND', 'ADMIN'], required: true },
        amount: { type: Number, required: true },
        reason: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    // Expiration Logic
    coinsExpiry: [{
        amount: { type: Number, required: true },
        expiresAt: { type: Date, required: true } // 60 days from earn
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('UserEconomy', userEconomySchema);
