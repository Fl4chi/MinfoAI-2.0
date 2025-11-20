const GuildConfig = require('../database/guildConfigSchema');
const { EmbedBuilder } = require('discord.js');
const errorLogger = require('../utils/errorLogger');

/**
 * AutoPartnership Service
 * Handles the automated matching and posting of partnerships.
 */
class AutoPartnershipService {
    constructor(client) {
        this.client = client;
        this.interval = null;
    }

    /**
     * Starts the auto-partnership cron job
     */
    start() {
        // Run every hour to check for servers that need posting
        this.interval = setInterval(() => this.runCycle(), 60 * 60 * 1000);
        errorLogger.logInfo('INFO', 'Auto-Partnership Service Started', 'AUTO_PARTNER_START');

        // Run immediately on start for testing (optional, maybe remove for prod)
        // this.runCycle(); 
    }

    /**
     * Main execution cycle
     */
    async runCycle() {
        try {
            errorLogger.logInfo('INFO', 'Running Auto-Partnership Cycle...', 'AUTO_PARTNER_CYCLE');

            // 1. Find servers that are configured and ready to post
            // Logic: lastPostDate > 48h ago (or 24h if boosted)
            const now = new Date();
            const allGuilds = await GuildConfig.find({ isConfigured: true });

            for (const guildConfig of allGuilds) {
                if (!this.shouldPost(guildConfig, now)) continue;

                // 2. Find a match for this guild
                const match = await this.findMatch(guildConfig, allGuilds);

                if (match) {
                    // 3. Post the match in the current guild's channel
                    await this.postPartnership(guildConfig, match);

                    // 4. Update lastPostDate
                    guildConfig.serverProfile.lastPostDate = now;
                    await guildConfig.save();
                }
            }
        } catch (error) {
            errorLogger.logError('CRITICAL', 'Auto-Partnership Cycle Failed', 'AUTO_PARTNER_ERROR', error);
        }
    }

    /**
     * Determines if a guild is ready to receive a new partner
     */
    shouldPost(guildConfig, now) {
        if (!guildConfig.serverProfile || !guildConfig.serverProfile.description) return false;

        const lastPost = guildConfig.serverProfile.lastPostDate ? new Date(guildConfig.serverProfile.lastPostDate) : new Date(0);
        const hoursSinceLast = (now - lastPost) / (1000 * 60 * 60);

        // Check for boost
        const isBoosted = guildConfig.economy?.boostActive && new Date(guildConfig.economy.boostExpiresAt) > now;
        const cooldown = isBoosted ? 24 : 48;

        return hoursSinceLast >= cooldown;
    }

    /**
     * Finds a suitable partner for the target guild
     * Simple algorithm: Same tags > Similar size > Random
     */
    async findMatch(targetGuild, allGuilds) {
        // Filter out self and unconfigured
        let candidates = allGuilds.filter(g =>
            g.guildId !== targetGuild.guildId &&
            g.serverProfile &&
            g.serverProfile.description
        );

        if (candidates.length === 0) return null;

        // 1. Tag Match (Priority)
        const targetTags = targetGuild.serverProfile.tags || [];
        const tagMatches = candidates.filter(c =>
            c.serverProfile.tags && c.serverProfile.tags.some(t => targetTags.includes(t))
        );

        if (tagMatches.length > 0) {
            return tagMatches[Math.floor(Math.random() * tagMatches.length)];
        }

        // 2. Fallback: Random
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    /**
     * Posts the partnership embed
     */
    async postPartnership(hostGuild, partnerGuild) {
        try {
            const channel = await this.client.channels.fetch(hostGuild.partnershipChannelId);
            if (!channel) return;

            const profile = partnerGuild.serverProfile;

            const embed = new EmbedBuilder()
                .setColor('#00F0FF')
                .setTitle(`🤝 Nuova Partnership: ${partnerGuild.guildName}`)
                .setDescription(profile.description)
                .addFields(
                    { name: '🏷️ Tags', value: profile.tags.join(', ') || 'Nessuno', inline: true },
                    { name: '👥 Membri', value: `${profile.memberCount || 'N/A'}`, inline: true }
                )
                .setThumbnail(profile.iconUrl)
                .setFooter({ text: 'MinfoAI Auto-Partner • Unisciti e guadagna Coins!' });

            const actionRow = {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 5, // Link Button
                        label: 'Entra nel Server',
                        url: profile.inviteLink || 'https://discord.gg/'
                    }
                ]
            };

            await channel.send({ embeds: [embed], components: [actionRow] });

            errorLogger.logInfo('INFO', `Posted partner ${partnerGuild.guildName} in ${hostGuild.guildName}`, 'AUTO_PARTNER_POST');

        } catch (error) {
            errorLogger.logError('ERROR', `Failed to post in ${hostGuild.guildName}`, 'POST_FAILED', error);
        }
    }
}

module.exports = AutoPartnershipService;
