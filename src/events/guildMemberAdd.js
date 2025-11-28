const PendingReward = require('../database/pendingRewardSchema');
const errorLogger = require('../utils/errorLogger');
const LogHandler = require('../handlers/logHandler');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        try {
            // 1. Log the Join
            const logHandler = new LogHandler(member.client);
            await logHandler.log('MEMBER_JOIN', member.guild, { member });

            // 2. Track Pending Reward (10 days unlock)
            const unlockDate = new Date();
            unlockDate.setDate(unlockDate.getDate() + 10);

            const pending = new PendingReward({
                userId: member.id,
                guildId: member.guild.id,
                rewardUnlockDate: unlockDate,
                status: 'PENDING'
            });

            await pending.save();
            errorLogger.logInfo('INFO', `Tracking reward for user ${member.id}`, 'REWARD_TRACK_START');

        } catch (error) {
            errorLogger.logError('ERROR', 'Failed to track member join', 'MEMBER_ADD_ERROR', error);
        }
    }
};
