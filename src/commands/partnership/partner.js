const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const errorLogger = require('../../utils/errorLogger');
const conversationalAI = require('../../ai/conversationalAI');
const userProfiler = require('../../ai/userProfiler');
const { v4: uuidv4 } = require('uuid');
const { sendPartnershipNotification } = require('../../handlers/notificationHandler');
const ButtonHandler = require('../../utils/buttonHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('partner')
        .setDescription('🤝 Gestisci le tue partnership')
        .addSubcommand(sub =>
            sub.setName('request')
                .setDescription('📬 Richiedi una nuova partnership')
                .addStringOption(option => option.setName('server-name').setDescription('Nome del tuo server').setRequired(true))
                .addStringOption(option => option.setName('invite-link').setDescription('Link di invito permanente').setRequired(true))
                .addStringOption(option => option.setName('description').setDescription('Descrizione del server').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('📊 Mostra le partnership attive')
        )
        .addSubcommand(sub =>
            sub.setName('view')
                .setDescription('🔍 Visualizza i dettagli di una partnership')
                .addStringOption(option => option.setName('id').setDescription('ID della partnership').setRequired(true))
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            if (subcommand === 'request') {
                await handleRequest(interaction);
            } else if (subcommand === 'list') {
                await handleList(interaction);
            } else if (subcommand === 'view') {
                await handleView(interaction);
            }
        } catch (error) {
            errorLogger.logError('ERROR', `Partner command failed: ${subcommand}`, 'PARTNER_CMD_ERROR', error);
            await interaction.editReply({ content: '❌ Si è verificato un errore durante l\'esecuzione del comando.' });
        }
    }
};

async function handleRequest(interaction) {
    const serverName = interaction.options.getString('server-name');
    const inviteLink = interaction.options.getString('invite-link');
    const description = interaction.options.getString('description');

    // Validation
    if (!inviteLink.includes('discord.gg') && !inviteLink.includes('discord.com/invite')) {
        return interaction.editReply({ content: '❌ **Link Non Valido:** Usa un link `discord.gg` o `discord.com/invite`.' });
    }
    if (description.length < 10 || description.length > 500) {
        return interaction.editReply({ content: '❌ **Descrizione Invalida:** Deve essere tra 10 e 500 caratteri.' });
    }

    // Check Existing
    const existing = await Partnership.findOne({
        $or: [{ 'primaryGuild.guildId': interaction.guildId }, { 'secondaryGuild.guildId': interaction.guildId }]
    });

    if (existing) {
        return interaction.editReply({ content: `❌ **Partnership Esistente:** Status: ${existing.status}` });
    }

    // AI Analysis
    const userProfile = await userProfiler.buildUserProfile(interaction.user, interaction.guild);
    const aiAnalysis = await conversationalAI.analyzeUserProfile(userProfile);
    const credScore = calculateCredibility(userProfile);

    // Create Partnership
    const partnership = new Partnership({
        partnershipId: uuidv4(),
        status: 'pending',
        primaryGuild: {
            guildId: interaction.guildId,
            guildName: interaction.guild.name,
            serverName: serverName,
            inviteLink: inviteLink,
            description: description,
            userId: interaction.user.id
        },
        aiAnalysis: {
            userProfile: aiAnalysis,
            credibilityScore: credScore,
            timestamp: new Date()
        },
        createdAt: new Date()
    });

    await partnership.save();

    // Notify Staff
    try {
        const staffRoleId = process.env.STAFF_ROLE_ID; // Or fetch from GuildConfig if available globally, but env is fallback
        // Ideally fetch from GuildConfig of the bot's home server, but for now use env or current guild if setup
        await sendPartnershipNotification(interaction.client, partnership, staffRoleId, interaction.guild);
    } catch (e) {
        errorLogger.logError('WARN', 'Notification failed', 'NOTIF_FAIL', e);
    }

    // Buttons
    const buttonHandler = new ButtonHandler(interaction.client.advancedLogger);
    const decisionButtons = buttonHandler.createPartnershipDecisionButtons(partnership.partnershipId);

    const embed = CustomEmbedBuilder.success('✅ Richiesta Inviata',
        `Partnership per **${serverName}** inviata!\n\n` +
        `**ID:** \`${partnership.partnershipId}\`\n` +
        `**AI Analysis:** ${aiAnalysis}\n` +
        `**Credibilità:** ${credScore}%\n` +
        `**Status:** In attesa`);

    await interaction.editReply({ embeds: [embed], components: [decisionButtons] });
}

async function handleList(interaction) {
    const partnerships = await Partnership.find({ status: 'active' });

    if (partnerships.length === 0) {
        return interaction.editReply({ content: '📊 Nessuna partnership attiva al momento.' });
    }

    const list = partnerships.map((p, i) =>
        `**${i + 1}.** ${p.primaryGuild.serverName} (\`${p.partnershipId}\`)`
    ).join('\n');

    const embed = CustomEmbedBuilder.info('📊 Partnership Attive', `**Totale:** ${partnerships.length}\n\n${list}`);
    await interaction.editReply({ embeds: [embed] });
}

async function handleView(interaction) {
    const id = interaction.options.getString('id');
    const partnership = await Partnership.findOne({ partnershipId: id });

    if (!partnership) {
        return interaction.editReply({ content: '❌ Partnership non trovata.' });
    }

    const embed = CustomEmbedBuilder.info(`🔍 Partnership ${partnership.partnershipId}`,
        `**Server:** ${partnership.primaryGuild.serverName}\n` +
        `**Status:** ${partnership.status}\n` +
        `**Creata:** ${partnership.createdAt.toLocaleDateString('it-IT')}\n` +
        `**Descrizione:** ${partnership.primaryGuild.description}\n` +
        `**AI Analysis:** ${partnership.aiAnalysis?.userProfile || 'N/A'}`);

    await interaction.editReply({ embeds: [embed] });
}

function calculateCredibility(userProfile) {
    let score = 50; // Base
    // Simplified logic
    if (userProfile.totalMessages > 100) score += 10;
    if (userProfile.joinDate && (Date.now() - userProfile.joinDate > 30 * 24 * 60 * 60 * 1000)) score += 20;
    return Math.min(score, 100);
}
