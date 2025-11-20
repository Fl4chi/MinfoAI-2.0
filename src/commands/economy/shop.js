const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const UserEconomy = require('../../database/userEconomySchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('🛒 Negozio MinfoAI: Usa i tuoi Coins per potenziare il server!'),

    async execute(interaction) {
        // 1. Get User Balance
        let userEco = await UserEconomy.findOne({ userId: interaction.user.id });
        if (!userEco) {
            userEco = new UserEconomy({ userId: interaction.user.id });
            await userEco.save();
        }

        // 2. Build Embed
        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🛒 MinfoAI Shop')
            .setDescription('Benvenuto nel negozio! Qui puoi spendere i tuoi **Coins** per ottenere vantaggi.')
            .addFields(
                { name: `💰 Il tuo Saldo: ${userEco.balance} Coins`, value: '\u200b' },
                { name: '🚀 Boost 3 Giorni (500 Coins)', value: 'Riduce il cooldown a **24h** per 3 giorni.' },
                { name: '⚡ Boost 1 Giorno (200 Coins)', value: 'Riduce il cooldown a **24h** per 24 ore.' },
                { name: '🔄 Reset Cooldown (500 Coins)', value: 'Resetta immediatamente il timer. Posta subito!' }
            )
            .setFooter({ text: 'Seleziona un oggetto per acquistarlo' });

        // 3. Build Buttons
        // IDs format: shop_buy_<item>_<variant>
        // Handled by ButtonHandler
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('shop_buy_boost_3d')
                .setLabel('Boost 3gg (500 💰)')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🚀'),
            new ButtonBuilder()
                .setCustomId('shop_buy_boost_1d')
                .setLabel('Boost 1gg (200 💰)')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⚡'),
            new ButtonBuilder()
                .setCustomId('shop_buy_reset')
                .setLabel('Reset (500 💰)')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🔄')
        );

        await interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
    }
};
