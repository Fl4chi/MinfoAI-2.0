const LogHandler = require('../handlers/logHandler');

module.exports = {
    name: 'guildBanAdd',
    async execute(ban) {
        const logHandler = new LogHandler(ban.client);
        await logHandler.log('MEMBER_BAN', ban.guild, {
            user: ban.user,
            reason: ban.reason
        });
    }
};
