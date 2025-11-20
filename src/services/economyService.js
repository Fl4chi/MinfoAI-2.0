const UserEconomy = require('../database/userEconomySchema');
const GuildConfig = require('../database/guildConfigSchema');
const errorLogger = require('../utils/errorLogger');

class EconomyService {

    /**
     * Add coins to a user
     */
    async addCoinsToUser(userId, amount, reason) {
        try {
            let userEco = await UserEconomy.findOne({ userId });
            if (!userEco) {
                userEco = new UserEconomy({ userId });
            }

            userEco.balance += amount;
            userEco.totalEarned += amount;

            // Add transaction
            userEco.transactions.push({
                type: 'EARN',
                amount,
                reason,
                timestamp: new Date()
            });

            // Add expiry (60 days)
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 60);
            userEco.coinsExpiry.push({
                amount,
                expiresAt: expiryDate
            });

            await userEco.save();
            return userEco.balance;
        } catch (error) {
            errorLogger.logError('ERROR', 'Failed to add coins to user', 'ECO_ADD_USER_FAIL', error);
            throw error;
        }
    }

    /**
     * Add coins to a guild (server)
     */
    async addCoinsToGuild(guildId, amount) {
        try {
            let guildConfig = await GuildConfig.findOne({ guildId });
            if (!guildConfig) return; // Should not happen if configured

            if (!guildConfig.economy) guildConfig.economy = { balance: 0, totalEarned: 0 };

            guildConfig.economy.balance += amount;
            guildConfig.economy.totalEarned += amount;

            await guildConfig.save();
            return guildConfig.economy.balance;
        } catch (error) {
            errorLogger.logError('ERROR', 'Failed to add coins to guild', 'ECO_ADD_GUILD_FAIL', error);
            throw error;
        }
    }

    /**
     * Spend coins (User)
     */
    async spendUserCoins(userId, amount, reason) {
        try {
            const userEco = await UserEconomy.findOne({ userId });
            if (!userEco || userEco.balance < amount) {
                return false; // Insufficient funds
            }

            userEco.balance -= amount;
            userEco.transactions.push({
                type: 'SPEND',
                amount,
                reason,
                timestamp: new Date()
            });

            // Logic to remove from expiry array (FIFO) could be complex, simplified here:
            // We just reduce balance. The expiry job will handle cleaning up expired coins separately 
            // but we should technically deduct from the oldest non-expired chunks.
            // For MVP, we just track total balance.

            await userEco.save();
            return true;
        } catch (error) {
            errorLogger.logError('ERROR', 'Failed to spend user coins', 'ECO_SPEND_FAIL', error);
            throw error;
        }
    }
}

module.exports = new EconomyService();
