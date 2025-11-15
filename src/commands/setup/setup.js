const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const GuildConfig = require('../../database/guildConfigSchema');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configura il sistema partnership per il server')
    .addChannelOption(option =>
      option.setName('canale')
        .setDescription('Canale dove verranno inviate le richieste di partnership')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText))
    .addRoleOption(option =>
      option.setName('ruolo-staff')
        .setDescription('Ruolo che può gestire le partnership')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel('canale');
    const staffRole = interaction.options.getRole('ruolo-staff');

    try {
      let guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });

      if (guildConfig) {
        guildConfig.guildName = interaction.guild.name;
        guildConfig.partnershipChannelId = channel.id;
        guildConfig.staffRoleId = staffRole.id;
        guildConfig.isConfigured = true;
        guildConfig.configuredAt = new Date();
        guildConfig.configuredBy = interaction.user.id;
        await guildConfig.save();
      } else {
        guildConfig = await GuildConfig.create({
          guildId: interaction.guild.id,
          guildName: interaction.guild.name,
          partnershipChannelId: channel.id,
          staffRoleId: staffRole.id,
          isConfigured: true,
          configuredAt: new Date(),
          configuredBy: interaction.user.id
        });
      }

      const embed = createEmbed(
        '✅ Configurazione Completata',
        `Il sistema partnership è stato configurato con successo!\n\n` +
        `📢 **Canale Partnership:** ${channel}\n` +
        `👥 **Ruolo Staff:** ${staffRole}\n\n` +
        `Ora gli utenti possono usare \`/partnership-request\` per inviare richieste!`,
        'success'
      );

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('Errore nella configurazione:', error);
      
      const errorEmbed = createEmbed(
        '❌ Errore',
        'Si è verificato un errore durante la configurazione. Riprova più tardi.',
        'error'
      );

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};
