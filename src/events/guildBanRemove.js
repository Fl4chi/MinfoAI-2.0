const LogHandler = require('../handlers/logHandler');

module.exports = {
    name: 'guildBanRemove',
    async execute(ban) {
        const logHandler = new LogHandler(ban.client);
        await logHandler.log('MEMBER_UNBAN', ban.guild, { user: ban.user });
    }
};
