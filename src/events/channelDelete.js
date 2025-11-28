const LogHandler = require('../handlers/logHandler');

module.exports = {
    name: 'channelDelete',
    async execute(channel) {
        if (!channel.guild) return;
        const logHandler = new LogHandler(channel.client);
        await logHandler.log('CHANNEL_DELETE', channel.guild, { channel });
    }
};
