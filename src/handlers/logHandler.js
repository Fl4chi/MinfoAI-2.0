const { EmbedBuilder } = require('discord.js');

class LogHandler {
    constructor(client) {
        this.client = client;
        this.logChannelId = process.env.LOG_CHANNEL_ID;
    }

    async log(type, guild, data) {
        if (!this.logChannelId) return;
        const channel = guild.channels.cache.get(this.logChannelId);
        if (!channel) return;

        let embed;

        switch (type) {
            case 'MESSAGE_DELETE':
                embed = new EmbedBuilder()
                    .setColor('#ff4444')
                    .setAuthor({ name: data.author.tag, iconURL: data.author.displayAvatarURL() })
                    .setDescription(`**Message sent by <@${data.author.id}> deleted in <#${data.channel.id}>**\n${data.content}`)
                    .setFooter({ text: `User ID: ${data.author.id}` })
                    .setTimestamp();
                break;

            case 'MESSAGE_EDIT':
                embed = new EmbedBuilder()
                    .setColor('#3399ff')
                    .setAuthor({ name: data.author.tag, iconURL: data.author.displayAvatarURL() })
                    .setDescription(`**Message edited in <#${data.channel.id}>** [Jump to Message](${data.url})`)
                    .addFields(
                        { name: 'Before', value: data.oldContent || '*None*' },
                        { name: 'After', value: data.newContent || '*None*' }
                    )
                    .setFooter({ text: `User ID: ${data.author.id}` })
                    .setTimestamp();
                break;

            case 'MEMBER_JOIN':
                embed = new EmbedBuilder()
                    .setColor('#00ff88')
                    .setAuthor({ name: 'Member Joined', iconURL: data.member.user.displayAvatarURL() })
                    .setDescription(`<@${data.member.id}> ${data.member.user.tag}`)
                    .addFields(
                        { name: 'Account Age', value: `<t:${Math.floor(data.member.user.createdTimestamp / 1000)}:R>`, inline: true }
                    )
                    .setFooter({ text: `ID: ${data.member.id}` })
                    .setTimestamp();
                break;

            case 'MEMBER_LEAVE':
                embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setAuthor({ name: 'Member Left', iconURL: data.member.user.displayAvatarURL() })
                    .setDescription(`<@${data.member.id}> ${data.member.user.tag}`)
                    .setFooter({ text: `ID: ${data.member.id}` })
                    .setTimestamp();
                break;

            case 'MEMBER_BAN':
                embed = new EmbedBuilder()
                    .setColor('#8b0000') // Dark Red
                    .setAuthor({ name: 'Member Banned', iconURL: data.user.displayAvatarURL() })
                    .setDescription(`**${data.user.tag}** was banned from the server.`)
                    .addFields({ name: 'Reason', value: data.reason || 'No reason provided' })
                    .setFooter({ text: `ID: ${data.user.id}` })
                    .setTimestamp();
                break;

            case 'MEMBER_UNBAN':
                embed = new EmbedBuilder()
                    .setColor('#00ff00') // Green
                    .setAuthor({ name: 'Member Unbanned', iconURL: data.user.displayAvatarURL() })
                    .setDescription(`**${data.user.tag}** was unbanned.`)
                    .setFooter({ text: `ID: ${data.user.id}` })
                    .setTimestamp();
                break;

            case 'ROLE_UPDATE':
                embed = new EmbedBuilder()
                    .setColor('#ffa500') // Orange
                    .setAuthor({ name: 'Member Updated', iconURL: data.member.user.displayAvatarURL() })
                    .setDescription(`**${data.member.user.tag}** roles/nickname were updated.`)
                    .addFields(data.changes)
                    .setFooter({ text: `ID: ${data.member.id}` })
                    .setTimestamp();
                break;

            case 'CHANNEL_CREATE':
                embed = new EmbedBuilder()
                    .setColor('#00ffff') // Cyan
                    .setAuthor({ name: 'Channel Created', iconURL: guild.iconURL() })
                    .setDescription(`**#${data.channel.name}** was created.`)
                    .addFields(
                        { name: 'Type', value: `${data.channel.type}`, inline: true },
                        { name: 'Category', value: `${data.channel.parent ? data.channel.parent.name : 'None'}`, inline: true }
                    )
                    .setFooter({ text: `ID: ${data.channel.id}` })
                    .setTimestamp();
                break;

            case 'CHANNEL_DELETE':
                embed = new EmbedBuilder()
                    .setColor('#ff00ff') // Magenta
                    .setAuthor({ name: 'Channel Deleted', iconURL: guild.iconURL() })
                    .setDescription(`**#${data.channel.name}** was deleted.`)
                    .setFooter({ text: `ID: ${data.channel.id}` })
                    .setTimestamp();
                break;

            case 'VOICE_UPDATE':
                embed = new EmbedBuilder()
                    .setColor('#ffff00') // Yellow
                    .setAuthor({ name: 'Voice State Update', iconURL: data.member.user.displayAvatarURL() })
                    .setDescription(data.description)
                    .setFooter({ text: `ID: ${data.member.id}` })
                    .setTimestamp();
                break;
        }

        if (embed) {
            await channel.send({ embeds: [embed] });
        }
    }
}

module.exports = LogHandler;
