const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const UserEconomy = require('../../database/userEconomySchema');
const Partnership = require('../../database/partnershipSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('📊 Visualizza le statistiche complete utente')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Utente di cui vedere le statistiche (opzionale)')),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        // 1. Fetch Data
        const userEco = await UserEconomy.findOne({ userId: targetUser.id }) || { balance: 0, totalEarned: 0, createdAt: new Date() };

        // Count Partnerships (Approved ones initiated by this user)
        const activePartnerships = await Partnership.countDocuments({ 'initiator.userId': targetUser.id, status: 'active' });
        const totalPartnerships = await Partnership.countDocuments({ 'initiator.userId': targetUser.id });

        // Calculate "Trust Score" (Example logic)
        // Base 50 + (Partnerships * 5) + (Coins / 100) - capped at 100
        let trustScore = 50 + (activePartnerships * 5) + Math.floor(userEco.totalEarned / 1000);
        if (trustScore > 100) trustScore = 100;

        // Dates
        const joinDiscord = Math.floor(targetUser.createdTimestamp / 1000);
        const joinServer = targetMember ? Math.floor(targetMember.joinedTimestamp / 1000) : 'N/A';
        const startBot = Math.floor(new Date(userEco.createdAt).getTime() / 1000);

        // 2. Build Embed
        const embed = new EmbedBuilder()
            .setColor('#00F0FF')
            .setTitle(`📊 Statistiche di ${targetUser.username}`)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '👤 Info Utente', value: `**Discord:** <t:${joinDiscord}:R>\n**Server:** ${joinServer !== 'N/A' ? `<t:${joinServer}:R>` : 'Non nel server'}\n**Bot User:** <t:${startBot}:R>`, inline: false },
                { name: '💰 Economy', value: `**Saldo:** ${userEco.balance} Coins\n**Totale Guadagnato:** ${userEco.totalEarned} Coins`, inline: true },
                { name: '🤝 Partnership', value: `**Totali:** ${totalPartnerships}\n**Attive:** ${activePartnerships}`, inline: true },
                { name: '🛡️ Trust Score', value: `**${trustScore}/100**`, inline: true }
            )
            .setFooter({ text: `ID: ${targetUser.id}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] }); // Public stats are fine, or use ephemeral if preferred. User didn't specify.
    }
};
