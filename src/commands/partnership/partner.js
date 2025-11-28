const { SlashCommandBuilder, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const errorLogger = require('../../utils/errorLogger');
const conversationalAI = require('../../ai/conversationalAI');
const { v4: uuidv4 } = require('uuid');
const { sendPartnershipNotification } = require('../../handlers/notificationHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('partner')
        .setDescription('🤝 Gestisci le tue partnership')
        .addSubcommand(sub =>
            sub.setName('request')
                .setDescription('📬 Richiedi una nuova partnership')
                .addStringOption(option => option.setName('invite-link').setDescription('Link di invito permanente').setRequired(true))
                .addStringOption(option => option.setName('description').setDescription('Descrizione del server').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('stats')
                .setDescription('📊 Statistiche partnership')
        )
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('📜 Lista partnership attive')
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            if (subcommand === 'request') {
                await handleRequest(interaction);
            } else if (subcommand === 'stats') {
                await handleStats(interaction);
            } else if (subcommand === 'list') {
                await handleList(interaction);
            }
        } catch (error) {
            errorLogger.logError('ERROR', `Partner command failed: ${subcommand}`, 'PARTNER_CMD_ERROR', error);
            await interaction.editReply({ content: '❌ Si è verificato un errore durante l\'esecuzione del comando.' });
        }
    }
};

async function handleRequest(interaction) {
    const inviteLink = interaction.options.getString('invite-link');
    const description = interaction.options.getString('description');

    // 1. Fetch Invite Info
    let inviteInfo = { name: 'Sconosciuto', memberCount: 0, icon: null };
    try {
        const inviteCode = inviteLink.split('/').pop();
        const invite = await interaction.client.fetchInvite(inviteCode);
        if (invite && invite.guild) {
            inviteInfo = {
                name: invite.guild.name,
                memberCount: invite.memberCount,
                icon: invite.guild.iconURL()
            };
        }
    } catch (e) {
        // Invite might be invalid or expired, proceed with manual data
        inviteInfo.name = "Server (Link non verificato)";
    }

    // 2. AI Analysis
    const aiResult = await conversationalAI.analyzePartnershipRequest({
        serverName: inviteInfo.name,
        description: description,
        memberCount: inviteInfo.memberCount,
        user: interaction.user
    });

    // 3. Create Partnership
    const partnership = new Partnership({
        partnershipId: uuidv4(),
        status: 'pending',
        primaryGuild: {
            guildId: interaction.guildId,
            guildName: interaction.guild.name,
            serverName: inviteInfo.name,
            inviteLink: inviteLink,
            description: description,
            userId: interaction.user.id,
            memberCount: inviteInfo.memberCount,
            iconUrl: inviteInfo.icon || ''
        },
        aiAnalysis: {
            credibilityScore: aiResult.credibilityScore,
            riskLevel: aiResult.riskLevel,
            summary: aiResult.summary,
            recommendation: aiResult.recommendation,
            timestamp: new Date()
        }
    });

    await partnership.save();

    // 4. Notify Staff (DM or Channel)
    // This function should be updated to send the "Smart Notification"
    // For now, we simulate the user feedback

    // 5. Reply to User
    const embed = new EmbedBuilder()
        .setColor(aiResult.riskLevel === 'HIGH' ? '#ff4444' : '#00ff88')
        .setTitle('📬 Richiesta Partnership Inviata')
        .setDescription(`La tua richiesta per **${inviteInfo.name}** è stata inviata allo staff.`)
        .addFields(
            { name: '🤖 AI Analysis', value: `**Credibilità:** ${aiResult.credibilityScore}/100\n**Rischio:** ${aiResult.riskLevel}\n*${aiResult.summary}*` },
            { name: '📊 Server Stats', value: `**Membri:** ${inviteInfo.memberCount}\n**Link:** ${inviteLink}` }
        )
        .setThumbnail(inviteInfo.icon)
        .setFooter({ text: `ID: ${partnership.partnershipId}` });

    await interaction.editReply({ embeds: [embed] });
}

async function handleStats(interaction) {
    const total = await Partnership.countDocuments();
    const active = await Partnership.countDocuments({ status: 'active' });
    const pending = await Partnership.countDocuments({ status: 'pending' });
    const rejected = await Partnership.countDocuments({ status: 'rejected' });

    const activePercent = total > 0 ? ((active / total) * 100).toFixed(1) : 0;
    const pendingPercent = total > 0 ? ((pending / total) * 100).toFixed(1) : 0;
    const rejectedPercent = total > 0 ? ((rejected / total) * 100).toFixed(1) : 0;

    const embed = new EmbedBuilder()
        .setColor('#6366f1')
        .setTitle('📊 Partnership Stats')
        .setDescription('Statistiche globali delle partnership di MinfoAI')
        .addFields(
            { name: '📈 Totale', value: `${total}`, inline: true },
            { name: '✅ Attive', value: `${active} (${activePercent}%)`, inline: true },
            { name: '⏳ Pending', value: `${pending} (${pendingPercent}%)`, inline: true },
            { name: '❌ Rifiutate', value: `${rejected} (${rejectedPercent}%)`, inline: true }
        )
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

async function handleList(interaction) {
    const partnerships = await Partnership.find({ status: 'active' }).limit(10);

    if (partnerships.length === 0) {
        return interaction.editReply({ content: 'Nessuna partnership attiva.' });
    }

    const list = partnerships.map(p => `• **${p.primaryGuild.serverName}** - [Unisciti](${p.primaryGuild.inviteLink})`).join('\n');

    const embed = new EmbedBuilder()
        .setColor('#00ff88')
        .setTitle('📜 Partnership Attive')
        .setDescription(list);

    await interaction.editReply({ embeds: [embed] });
}
