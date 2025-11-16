const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../database/guildConfigSchema');
const errorLogger = require('../../utils/errorLogger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('🔧 Configura il sistema partnership per il server')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      // Verifica canali e ruoli
      const channels = interaction.guild.channels.cache
        .filter(ch => ch.isTextBased() && ch.type === 0)
        .map(ch => ({ label: `#${ch.name}`, value: ch.id }))
        .slice(0, 25);

      const roles = interaction.guild.roles.cache
        .filter(role => role.id !== interaction.guild.id && role.managed)
        .map(role => ({ label: role.name, value: role.id }))
        .slice(0, 25);

      if (channels.length === 0 || roles.length === 0) {
        errorLogger.logError('ERROR', 'Non sono stati trovati canali o ruoli disponibili per la configurazione.', 'INVALID_GUILD_CONFIG');
        return interaction.editReply({
          content: '❌ Non sono stati trovati canali o ruoli disponibili per la configurazione.',
          ephemeral: true
        });
      }

      // Create embed
      const embed = new EmbedBuilder()
        .setColor('#2f3136')
        .setTitle('🔧 Configura Partnership System')
        .setDescription('Seleziona il canale dove verranno pubblicate le richieste di partnership')
        .addFields(
          { name: '📋 Stato Configurazione', value: 'In corso...', inline: false }
        );

      // Select menu per canale
      const channelMenu = new StringSelectMenuBuilder()
        .setCustomId('partnership_channel')
        .setPlaceholder('Seleziona il canale...')
        .addOptions(channels);

      const row1 = new ActionRowBuilder().addComponents(channelMenu);

      // Select menu per ruolo
      const roleMenu = new StringSelectMenuBuilder()
        .setCustomId('partnership_role')
        .setPlaceholder('Seleziona il ruolo di approvazione...')
        .addOptions(roles);

      const row2 = new ActionRowBuilder().addComponents(roleMenu);

      const response = await interaction.editReply({
        embeds: [embed],
        components: [row1, row2],
        ephemeral: true
      });

      // Raccogliere selezioni
      const collectorFilter = (i) => i.user.id === interaction.user.id;
      const collector = response.createMessageComponentCollector({ filter: collectorFilter, time: 60000 });

      let selectedChannel = null;
      let selectedRole = null;
      let selectionsCount = 0;

      collector.on('collect', async (i) => {
        try {
          if (i.customId === 'partnership_channel') {
            selectedChannel = i.values[0];
            selectionsCount++;
            errorLogger.logInfo('INFO', `Canale selezionato: ${selectedChannel}`, 'CONFIG_CHANNEL_SELECTED');
          } else if (i.customId === 'partnership_role') {
            selectedRole = i.values[0];
            selectionsCount++;
            errorLogger.logInfo('INFO', `Ruolo selezionato: ${selectedRole}`, 'CONFIG_ROLE_SELECTED');
          }

          if (selectionsCount === 2) {
            collector.stop();
            // Salva configurazione
            try {
              let guildConfig = await GuildConfig.findOne({ guildId: interaction.guildId });
              if (!guildConfig) {
                guildConfig = new GuildConfig({
                  guildId: interaction.guildId,
                  partnershipChannel: selectedChannel,
                  approvalRole: selectedRole
                });
              } else {
                guildConfig.partnershipChannel = selectedChannel;
                guildConfig.approvalRole = selectedRole;
              }
              await guildConfig.save();
              errorLogger.logInfo('INFO', 'Configurazione salvata con successo', 'CONFIG_SAVED');
              
              await i.deferUpdate();
              const successEmbed = new EmbedBuilder()
                .setColor('#43b581')
                .setTitle('✅ Configurazione Completata')
                .addFields(
                  { name: '📋 Canale Partnership', value: `<#${selectedChannel}>`, inline: false },
                  { name: '👥 Ruolo Approvazione', value: `<@&${selectedRole}>`, inline: false }
                )
                .setTimestamp();

              await interaction.editReply({
                embeds: [successEmbed],
                components: [],
                ephemeral: true
              });
            } catch (saveErr) {
              errorLogger.logError('ERROR', 'Errore nel salvataggio della configurazione', 'PARTNERSHIP_UPDATE_FAILED', saveErr);
              await i.deferUpdate();
              await interaction.editReply({
                content: '❌ Errore nel salvataggio della configurazione.',
                components: [],
                ephemeral: true
              });
            }
          } else {
            await i.deferUpdate();
          }
        } catch (collectorErr) {
          errorLogger.logError('ERROR', 'Errore nel collector del menu', 'MENU_INTERACTION_FAILED', collectorErr);
        }
      });

      collector.on('end', (collected) => {
        if (collected.size === 0) {
          errorLogger.logWarn('WARNING', 'Configurazione non completata entro il timeout', 'CONFIG_TIMEOUT');
          interaction.editReply({
            content: '⏱️ Tempo scaduto. Configurazione annullata.',
            components: [],
            ephemeral: true
          }).catch(err => errorLogger.logError('ERROR', 'Errore durante timeout handling', 'TIMEOUT_HANDLE_ERROR', err));
        }
      });

    } catch (error) {
      errorLogger.logError('CRITICAL', 'Errore durante esecuzione comando setup', 'COMMAND_EXECUTION_FAILED', error);
      await interaction.editReply({
        content: '❌ Errore durante l\'esecuzione del comando.',
        ephemeral: true
      });
    }
  }
};
