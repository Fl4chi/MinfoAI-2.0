const PendingReward = require('../database/pendingRewardSchema');
const errorLogger = require('../utils/errorLogger');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        try {
            // Check if this guild is configured for rewards
            // (Optional: Check if guild has active partnership campaign)

            // Calculate unlock date (10 days from now)
            const unlockDate = new Date();
            unlockDate.setDate(unlockDate.getDate() + 10);

            // Create Pending Reward
            const pending = new PendingReward({
                userId: member.id,
                guildId: member.guild.id,
                rewardUnlockDate: unlockDate,
                status: 'PENDING'
            });

            await pending.save();

            errorLogger.logInfo('INFO', `Tracking reward for user ${member.id} in ${member.guild.name}`, 'REWARD_TRACK_START');

        } catch (error) {
            errorLogger.logError('ERROR', 'Failed to track member join', 'MEMBER_ADD_ERROR', error);
        }
    }
};
