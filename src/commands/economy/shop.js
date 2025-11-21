const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const UserEconomy = require('../../database/userEconomySchema');
const GuildConfig = require('../../database/guildConfigSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('🛒 Negozio MinfoAI: Boost e Tier Upgrade!'),

    async execute(interaction) {
        // Get User & Guild Data
        let userEco = await UserEconomy.findOne({ userId: interaction.user.id });
        if (!userEco) {
            userEco = new UserEconomy({ userId: interaction.user.id });
            await userEco.save();
        }

        let guildConfig = await GuildConfig.findOne({ guildId: interaction.guildId });
        if (!guildConfig) {
            return interaction.reply({ content: '❌ Server non configurato. Usa `/setup` prima!', flags: MessageFlags.Ephemeral });
        }

        const currentTier = guildConfig.economy.tier || 'bronze';
        const tierEmojis = { bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎' };

        // Build Embed - SEMPLIFICATO
        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🛒 MinfoAI Shop')
            .setDescription(`**Tier:** ${tierEmojis[currentTier]} ${currentTier.toUpperCase()} | **Saldo:** 💰 ${userEco.balance} Coins`)
            .addFields(
                {
                    name: '🚀 Boost',
                    value: '**3 Giorni** (500💰) - Cooldown 24h per 3gg\n**1 Giorno** (200💰) - Cooldown 24h per 1gg\n**Reset** (500💰) - Posta subito!',
                    inline: false
                }
            );

        // Add tier info based on current tier
        if (currentTier === 'bronze') {
            embed.addFields({
                name: '🥈 Silver Tier - 1000💰',
                value: '**Requisiti:** 10 partnership, 30gg attività\n**Vantaggi:** Cooldown 40h, +15% coins',
                inline: false
            });
        } else if (currentTier === 'silver') {
            embed.addFields({
                name: '🥇 Gold Tier - 2500💰',
                value: '**Requisiti:** 30 partnership, 60gg attività, 15+ attive\n**Vantaggi:** Cooldown 32h, +30% coins, priorità',
                inline: false
            });
        } else if (currentTier === 'gold') {
            embed.addFields({
                name: '💎 Platinum Tier - 5000💰',
                value: '**Requisiti:** 75 partnership, 120gg attività, 30+ attive\n**Vantaggi:** Cooldown 24h, +50% coins, boost gratis',
                inline: false
            });
        } else {
            embed.addFields({
                name: '💎 Platinum',
                value: '✅ Massimo livello raggiunto!',
                inline: false
            });
        }

        // Build Buttons - SEMPLIFICATO
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('shop_buy_boost_3d')
                .setLabel('Boost 3gg')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🚀'),
            new ButtonBuilder()
                .setCustomId('shop_buy_boost_1d')
                .setLabel('Boost 1gg')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⚡'),
            new ButtonBuilder()
                .setCustomId('shop_buy_reset_cooldown')
                .setLabel('Reset')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🔄')
        );

        const components = [row1];

        // Add tier upgrade button if not platinum
        if (currentTier !== 'platinum') {
            const nextTier = currentTier === 'bronze' ? 'silver' : currentTier === 'silver' ? 'gold' : 'platinum';
            const tierCosts = { silver: 1000, gold: 2500, platinum: 5000 };

            const tierButton = new ButtonBuilder()
                .setCustomId(`shop_buy_tier_${nextTier}`)
                .setLabel(`Unlock ${nextTier.toUpperCase()} (${tierCosts[nextTier]}💰)`)
                .setStyle(ButtonStyle.Success)
                .setEmoji(tierEmojis[nextTier]);

            const row2 = new ActionRowBuilder().addComponents(tierButton);
            components.push(row2);
        }

        await interaction.reply({ embeds: [embed], components, flags: MessageFlags.Ephemeral });
    }
};
