const LogHandler = require('../handlers/logHandler');

module.exports = {
    name: 'channelCreate',
    async execute(channel) {
        if (!channel.guild) return;
        const logHandler = new LogHandler(channel.client);
        await logHandler.log('CHANNEL_CREATE', channel.guild, { channel });
    }
};
