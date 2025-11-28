const Partnership = require('../database/partnershipSchema');
const { EmbedBuilder } = require('discord.js');

class PartnershipService {
    constructor(client) {
        this.client = client;
        this.checkInterval = 60 * 60 * 1000; // 1 hour
        this.staffRoleId = process.env.STAFF_ROLE_ID;
    }

    start() {
        console.log('[PartnershipService] Started background checks.');
        setInterval(() => this.checkPendingRequests(), this.checkInterval);
    }

    async checkPendingRequests() {
        try {
            const pending = await Partnership.find({ status: 'pending' });
            if (pending.length === 0) return;

            // Filter requests older than 2 hours
            const now = Date.now();
            const longPending = pending.filter(p => (now - new Date(p.createdAt).getTime()) > (2 * 60 * 60 * 1000));

            if (longPending.length > 0) {
                await this.notifyStaff(longPending);
            }
        } catch (error) {
            console.error('[PartnershipService] Error checking pending requests:', error);
        }
    }

    async notifyStaff(requests) {
        // Find a guild to send notifications (usually the main bot guild)
        // For simplicity, we iterate over guilds or use a config. 
        // Here we assume the bot is in at least one guild with the staff role.

        // This is a simplified notification logic. In a real scenario, you'd fetch the specific guild config.
        const guild = this.client.guilds.cache.first();
        if (!guild) return;

        // Find members with staff role
        // Note: Fetching all members might be expensive on large servers.
        // Better to send to a specific channel if configured.

        // Construct the message
        const embed = new EmbedBuilder()
            .setColor('#ffa500')
            .setTitle('⚠️ Partnership in Attesa')
            .setDescription(`Ci sono **${requests.length}** richieste in attesa da più di 2 ore.`)
            .addFields(
                requests.map(r => ({
                    name: r.primaryGuild.serverName,
                    value: `Credibility: ${r.aiAnalysis.credibilityScore}% | ID: \`${r.partnershipId}\``,
                    inline: true
                }))
            )
            .setFooter({ text: 'MinfoAI Smart Notifications' });

        // Send to a log channel or specific user for now as fallback
        // Ideally, use a configured channel ID from DB
        const logChannelId = process.env.LOG_CHANNEL_ID;
        if (logChannelId) {
            const channel = guild.channels.cache.get(logChannelId);
            if (channel) await channel.send({ embeds: [embed] });
        }
    }
}

module.exports = PartnershipService;
