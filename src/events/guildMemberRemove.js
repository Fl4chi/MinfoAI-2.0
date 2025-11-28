const LogHandler = require('../handlers/logHandler');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        const logHandler = new LogHandler(member.client);
        await logHandler.log('MEMBER_LEAVE', member.guild, { member });
    }
};
