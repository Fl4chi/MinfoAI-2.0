const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../database/guildConfigSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('⚙️ Configura il sistema partnership per il server')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      // Fetch all text channels and roles
      const channels = interaction.guild.channels.cache
        .filter(ch => ch.isTextBased() && ch.type === 0)
        .map(ch => ({ label: `# ${ch.name}`, value: ch.id }))
        .slice(0, 25);

      const roles = interaction.guild.roles.cache
        .filter(role => role.id !== interaction.guild.id && !role.managed)
        .map(role => ({ label: role.name, value: role.id }))
        .slice(0, 25);

      if (channels.length === 0 || roles.length === 0) {
        return interaction.editReply({
          content: '❌ Non sono stati trovati canali o ruoli disponibili per la configurazione.',
          ephemeral: true
        });
      }

      // Create embed
      const setupEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('⚙️ Configurazione Sistema Partnership')
        .setDescription(
          '**Benvenuto nella configurazione del sistema partnership!**\n\n' +
          'Seleziona il **canale** dove verranno inviate le richieste di partnership.\n' +
          'Poi seleziona il **ruolo** che potrà gestire le partnership.\n\n' +
          '> 📢 **Canale Partnership**: Dove arriveranno le richieste\n' +
          '> 👥 **Ruolo Staff**: Chi può approvare/rifiutare'
        )
        .setFooter({ text: 'MinfoAI Partnership System' })
        .setTimestamp();

      // Create select menus
      const channelSelect = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('setup_channel')
            .setPlaceholder('📢 Seleziona il canale partnership')
            .addOptions(channels)
        );

      const roleSelect = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('setup_role')
            .setPlaceholder('👥 Seleziona il ruolo staff')
            .addOptions(roles)
        );

      await interaction.editReply({
        embeds: [setupEmbed],
        components: [channelSelect, roleSelect]
      });

      // Create collector
      const filter = i => i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });

      let selectedChannel = null;
      let selectedRole = null;

      collector.on('collect', async i => {
        if (i.customId === 'setup_channel') {
          selectedChannel = i.values[0];
          await i.update({
            embeds: [setupEmbed.setDescription(
              `**Benvenuto nella configurazione del sistema partnership!**\n\n` +
              `✅ **Canale selezionato**: <#${selectedChannel}>\n` +
              `${selectedRole ? `✅ **Ruolo selezionato**: <@&${selectedRole}>` : '> 👥 **Ruolo Staff**: Seleziona il ruolo che può gestire le partnership'}\n\n` +
              `${selectedChannel && selectedRole ? '✅ Configurazione completata! Salvataggio in corso...' : ''}`
            )],
            components: selectedChannel && selectedRole ? [] : [channelSelect, roleSelect]
          });

          if (selectedChannel && selectedRole) {
            await saveConfiguration(interaction, selectedChannel, selectedRole, i);
            collector.stop();
          }
        } else if (i.customId === 'setup_role') {
          selectedRole = i.values[0];
          await i.update({
            embeds: [setupEmbed.setDescription(
              `**Benvenuto nella configurazione del sistema partnership!**\n\n` +
              `${selectedChannel ? `✅ **Canale selezionato**: <#${selectedChannel}>` : '> 📢 **Canale Partnership**: Seleziona il canale per le richieste'}\n` +
              `✅ **Ruolo selezionato**: <@&${selectedRole}>\n\n` +
              `${selectedChannel && selectedRole ? '✅ Configurazione completata! Salvataggio in corso...' : ''}`
            )],
            components: selectedChannel && selectedRole ? [] : [channelSelect, roleSelect]
          });

          if (selectedChannel && selectedRole) {
            await saveConfiguration(interaction, selectedChannel, selectedRole, i);
            collector.stop();
          }
        }
      });

      collector.on('end', collected => {
        if (collected.size === 0) {
          interaction.editReply({
            content: '⏰ Tempo scaduto! Riprova con `/setup`',
            embeds: [],
            components: []
          });
        }
      });

    } catch (error) {
      console.error('Errore nella configurazione:', error);
      
      await interaction.editReply({
        content: '❌ Si è verificato un errore durante la configurazione. Riprova più tardi.',
        ephemeral: true
      });
    }
  }
};

async function saveConfiguration(interaction, channelId, roleId, i) {
  try {
    let guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });

    if (guildConfig) {
      guildConfig.guildName = interaction.guild.name;
      guildConfig.partnershipChannelId = channelId;
      guildConfig.staffRoleId = roleId;
      guildConfig.isConfigured = true;
      guildConfig.configuredAt = new Date();
      guildConfig.configuredBy = interaction.user.id;
      await guildConfig.save();
    } else {
      guildConfig = await GuildConfig.create({
        guildId: interaction.guild.id,
        guildName: interaction.guild.name,
        partnershipChannelId: channelId,
        staffRoleId: roleId,
        isConfigured: true,
        configuredAt: new Date(),
        configuredBy: interaction.user.id
      });
    }

    const successEmbed = new EmbedBuilder()
      .setColor('#57F287')
      .setTitle('✅ Configurazione Completata!')
      .setDescription(
        `Il sistema partnership è stato configurato con successo!\n\n` +
        `📢 **Canale Partnership**: <#${channelId}>\n` +
        `👥 **Ruolo Staff**: <@&${roleId}>\n\n` +
        `Gli utenti possono ora usare \`/partnership-request\` per inviare richieste!`
      )
      .setFooter({ text: `Configurato da ${interaction.user.tag}` })
      .setTimestamp();

    await i.followUp({
      embeds: [successEmbed],
      ephemeral: true
    });

  } catch (error) {
    console.error('Errore nel salvataggio:', error);
    await i.followUp({
      content: '❌ Errore nel salvataggio della configurazione.',
      ephemeral: true
    });
  }
}
