const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const UserEconomy = require('../../database/userEconomySchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wallet')
        .setDescription('💰 Controlla il tuo portafoglio'),

    async execute(interaction) {
        const userEco = await UserEconomy.findOne({ userId: interaction.user.id }) || { balance: 0 };

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('💰 Il tuo Portafoglio')
            .setDescription(`Hai attualmente **${userEco.balance} Coins** disponibili.`)
            .setFooter({ text: 'Usa /shop per spenderli!' });

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
};
