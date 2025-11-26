const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const errorLogger = require('../../utils/errorLogger');
const conversationalAI = require('../../ai/conversationalAI');
const userProfiler = require('../../ai/userProfiler');
const ButtonHandler = require('../../utils/buttonHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('manager')
        .setDescription('🛡️ Gestione Partnership (Staff)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub.setName('approve')
                .setDescription('✅ Approva una partnership')
                .addStringOption(option => option.setName('id').setDescription('ID Partnership').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('reject')
                .setDescription('❌ Rifiuta una partnership')
                .addStringOption(option => option.setName('id').setDescription('ID Partnership').setRequired(true))
                .addStringOption(option => option.setName('reason').setDescription('Motivo del rifiuto'))
        )
        .addSubcommand(sub =>
            sub.setName('delete')
                .setDescription('🗑️ Elimina una partnership')
                .addStringOption(option => option.setName('id').setDescription('ID Partnership').setRequired(true))
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            if (subcommand === 'approve') {
                await handleApprove(interaction);
            } else if (subcommand === 'reject') {
                await handleReject(interaction);
            } else if (subcommand === 'delete') {
                await handleDelete(interaction);
            }
        } catch (error) {
            errorLogger.logError('ERROR', `Manager command failed: ${subcommand}`, 'MANAGER_CMD_ERROR', error);
            await interaction.editReply({ content: '❌ Errore durante l\'esecuzione del comando.' });
        }
    }
};

async function handleApprove(interaction) {
    const id = interaction.options.getString('id');
    const partnership = await Partnership.findOne({ partnershipId: id, status: 'pending' });

    if (!partnership) {
        return interaction.editReply({ content: '❌ Partnership non trovata o già elaborata.' });
    }

    // AI Analysis
    let aiAnalysis = 'N/A';
    try {
        const member = await interaction.guild.members.fetch(partnership.primaryGuild.userId).catch(() => null);
        if (member) {
            const userProfile = await userProfiler.buildUserProfile(member, interaction.guild);
            aiAnalysis = await conversationalAI.analyzeUserProfile(userProfile);
        }
    } catch (e) { /* Ignore */ }

    partnership.status = 'active';
    partnership.approvedBy = interaction.user.id;
    if (!partnership.aiAnalysis) partnership.aiAnalysis = {};
    partnership.aiAnalysis.approvalAnalysis = aiAnalysis;
    partnership.aiAnalysis.timestamp = new Date();

    await partnership.save();

    // Buttons
    const buttonHandler = new ButtonHandler(interaction.client.advancedLogger);
    const actionButtons = buttonHandler.createPartnershipActionButtons(partnership.partnershipId);

    const embed = CustomEmbedBuilder.success('✅ Partnership Approvata',
        `**Server:** ${partnership.primaryGuild.serverName}\n` +
        `**ID:** \`${partnership.partnershipId}\`\n` +
        `**AI Analysis:** ${aiAnalysis}\n` +
        `**Status:** Attiva`);

    await interaction.editReply({ embeds: [embed], components: [actionButtons] });
}

async function handleReject(interaction) {
    const id = interaction.options.getString('id');
    const reason = interaction.options.getString('reason') || 'Nessun motivo specificato';
    const partnership = await Partnership.findOne({ partnershipId: id, status: 'pending' });

    if (!partnership) {
        return interaction.editReply({ content: '❌ Partnership non trovata o già elaborata.' });
    }

    partnership.status = 'rejected';
    partnership.rejectedBy = interaction.user.id;
    partnership.rejectionReason = reason;
    partnership.rejectedAt = new Date();

    await partnership.save();

    const embed = CustomEmbedBuilder.error('❌ Partnership Rifiutata',
        `**ID:** \`${partnership.partnershipId}\`\n` +
        `**Motivo:** ${reason}\n` +
        `**Status:** Rifiutata`);

    await interaction.editReply({ embeds: [embed] });
}

async function handleDelete(interaction) {
    const id = interaction.options.getString('id');
    const result = await Partnership.findOneAndDelete({ partnershipId: id });

    if (!result) {
        return interaction.editReply({ content: '❌ Partnership non trovata.' });
    }

    const embed = CustomEmbedBuilder.success('🗑️ Partnership Eliminata', `La partnership \`${id}\` è stata rimossa dal database.`);
    await interaction.editReply({ embeds: [embed] });
}
