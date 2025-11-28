const LogHandler = require('../handlers/logHandler');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage) {
        if (oldMessage.partial || newMessage.partial) return;
        if (oldMessage.author.bot) return;
        if (oldMessage.content === newMessage.content) return; // Ignore non-content updates

        const logHandler = new LogHandler(oldMessage.client);
        await logHandler.log('MESSAGE_EDIT', oldMessage.guild, {
            author: oldMessage.author,
            channel: oldMessage.channel,
            oldContent: oldMessage.content,
            newContent: newMessage.content,
            url: newMessage.url
        });
    }
};
