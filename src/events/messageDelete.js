const LogHandler = require('../handlers/logHandler');

module.exports = {
    name: 'messageDelete',
    async execute(message) {
        if (message.partial) return; // Cannot log partial messages
        if (message.author.bot) return;

        const logHandler = new LogHandler(message.client);
        await logHandler.log('MESSAGE_DELETE', message.guild, message);
    }
};
