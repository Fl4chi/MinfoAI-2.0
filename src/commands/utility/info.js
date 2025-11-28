const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserEconomy = require('../../database/userEconomySchema');
const Partnership = require('../../database/partnershipSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('🔍 Visualizza tutte le informazioni su un utente')
        .addUserOption(option => option.setName('user').setDescription('Utente da analizzare')),

    async execute(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(target.id);

        // Fetch Data
        const economy = await UserEconomy.findOne({ userId: target.id, guildId: interaction.guildId }) || { balance: 0, xp: 0, level: 1 };
        const partnerships = await Partnership.countDocuments({ 'primaryGuild.userId': target.id });
        const approved = await Partnership.countDocuments({ 'primaryGuild.userId': target.id, status: 'active' });

        // Calculate Trust Score (Simple Algo)
        const accountAgeDays = Math.floor((Date.now() - target.createdTimestamp) / (1000 * 60 * 60 * 24));
        const joinAgeDays = Math.floor((Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24));
        let trustScore = 50;
        if (accountAgeDays > 365) trustScore += 20;
        if (joinAgeDays > 30) trustScore += 10;
        if (partnerships > 0) trustScore += 10;
        if (approved > 0) trustScore += 10;
        trustScore = Math.min(trustScore, 100);

        const embed = new EmbedBuilder()
            .setColor('#6366f1')
            .setAuthor({ name: `Profilo Completo: ${target.tag}`, iconURL: target.displayAvatarURL() })
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '👤 Info Account', value: `**ID:** ${target.id}\n**Creato:** <t:${Math.floor(target.createdTimestamp / 1000)}:R>\n**Entrato:** <t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: '🛡️ Trust & Roles', value: `**Trust Score:** ${trustScore}/100\n**Ruoli:** ${member.roles.cache.size - 1}`, inline: true },
                { name: '💎 Economy', value: `**Coins:** ${economy.balance}\n**Livello:** ${economy.level} (XP: ${economy.xp})`, inline: true },
                { name: '🤝 Partnership', value: `**Richieste:** ${partnerships}\n**Approvate:** ${approved}`, inline: true }
            )
            .setFooter({ text: 'MinfoAI Advanced Profiler' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
