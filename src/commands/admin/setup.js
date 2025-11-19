const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelSelectMenuBuilder } = require('discord.js');
const GuildConfig = require('../../schemas/guildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configure il bot per il tuo server')
    .setDefaultMemberPermissions('ADMINISTRATOR')
    .setDMPermission(false),

  async execute(interaction) {
    try {
      const existingConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });

      if (existingConfig?.setupComplete) {
        return interaction.reply({
          embeds: [{
            color: 0xED4245,
            title: 'Setup Gia Completato',
            description: 'Il bot e gia stato configurato per questo server.',
            footer: { text: 'MinfoAI • Partnership Manager' },
          }],
          ephemeral: true,
        });
      }

      const modal = new ModalBuilder()
        .setCustomId('setupModal')
        .setTitle('Configurazione Bot');

      const guildNameInput = new TextInputBuilder()
        .setCustomId('guildName')
        .setLabel('Nome del Server')
        .setPlaceholder('Es. My Server')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(100);

      const firstRow = new ActionRowBuilder().addComponents(guildNameInput);
      modal.addComponents(firstRow);

      await interaction.showModal(modal);

    } catch (error) {
      interaction.client.advancedLogger?.error(`Setup error: ${error.message}`, error.stack);
      await interaction.reply({
        content: 'Errore durante il setup',
        ephemeral: true,
      }).catch(() => {});
    }
  },
};
