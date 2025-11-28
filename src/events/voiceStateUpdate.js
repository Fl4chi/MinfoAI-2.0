const LogHandler = require('../handlers/logHandler');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        const member = newState.member;
        if (!member || member.user.bot) return;

        const logHandler = new LogHandler(member.client);
        let description = '';

        if (!oldState.channelId && newState.channelId) {
            description = `**${member.user.tag}** joined voice channel **${newState.channel.name}**`;
        } else if (oldState.channelId && !newState.channelId) {
            description = `**${member.user.tag}** left voice channel **${oldState.channel.name}**`;
        } else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            description = `**${member.user.tag}** moved from **${oldState.channel.name}** to **${newState.channel.name}**`;
        } else {
            return; // Ignore mute/deafen updates for now to avoid spam
        }

        await logHandler.log('VOICE_UPDATE', member.guild, { member, description });
    }
};
