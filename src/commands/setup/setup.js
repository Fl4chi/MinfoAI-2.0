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

      // Broadened role filter: exclude @everyone and managed roles if needed, but show more options
      const roles = interaction.guild.roles.cache
        .filter(role => role.id !== interaction.guild.id) // Exclude @everyone
        .sort((a, b) => b.position - a.position) // Sort by position
        .map(role => ({ label: role.name, value: role.id }))
        .slice(0, 25); // Discord limit

      if (channels.length === 0 || roles.length === 0) {
        return interaction.editReply({
          content: '❌ Non sono stati trovati canali o ruoli disponibili per la configurazione.'
        });
      }

      // Create premium embed
      const embed = new EmbedBuilder()
        .setColor('#00F0FF') // Cyan Neon
        .setTitle('🚀 Configurazione MinfoAI')
        .setDescription('Benvenuto nel pannello di configurazione. Segui i passaggi qui sotto per attivare il sistema di partnership.\n\n**Passaggi richiesti:**')
        .addFields(
          { name: '1️⃣ Canale Partnership', value: 'Dove verranno pubblicate le richieste.', inline: true },
          { name: '2️⃣ Ruolo Staff', value: 'Chi può gestire le partnership.', inline: true },
          { name: '3️⃣ Canale Logs', value: 'Dove inviare i log di sistema.', inline: true },
          { name: 'ℹ️ Nota', value: 'Usa i menu a tendina qui sotto in ordine.', inline: false }
        )
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setFooter({ text: 'MinfoAI 2.0 • Premium Partnership System' });

      // 1. Select menu per canale partnership
      const channelMenu = new StringSelectMenuBuilder()
        .setCustomId('partnership_channel')
        .setPlaceholder('1️⃣ Seleziona Canale Partnership...')
        .addOptions(channels);

      const row1 = new ActionRowBuilder().addComponents(channelMenu);

      // 2. Select menu per ruolo
      const roleMenu = new StringSelectMenuBuilder()
        .setCustomId('partnership_role')
        .setPlaceholder('2️⃣ Seleziona Ruolo Staff...')
        .addOptions(roles);

      const row2 = new ActionRowBuilder().addComponents(roleMenu);

      // 3. Select menu per canale logs
      const logChannelMenu = new StringSelectMenuBuilder()
        .setCustomId('log_channel')
        .setPlaceholder('3️⃣ Seleziona Canale Logs...')
        .addOptions(channels);

      const row3 = new ActionRowBuilder().addComponents(logChannelMenu);

      const response = await interaction.editReply({
        embeds: [embed],
        components: [row1, row2, row3]
      });

      // Raccogliere selezioni
      const collectorFilter = (i) => i.user.id === interaction.user.id;
      const collector = response.createMessageComponentCollector({ filter: collectorFilter, time: 60000 });

      let selectedPartnershipChannel = null;
      let selectedRole = null;
      let selectedLogChannel = null;
      let selectionsCount = 0;

      collector.on('collect', async (i) => {
        try {
          // Update selections
          if (i.customId === 'partnership_channel') {
            selectedPartnershipChannel = i.values[0];
            await i.deferUpdate();
          } else if (i.customId === 'partnership_role') {
            selectedRole = i.values[0];
            await i.deferUpdate();
          } else if (i.customId === 'log_channel') {
            selectedLogChannel = i.values[0];
            await i.deferUpdate();
          }

          // Check if all 3 are selected
          if (selectedPartnershipChannel && selectedRole && selectedLogChannel) {
            collector.stop('completed');

            // Salva configurazione
            try {
              let guildConfig = await GuildConfig.findOne({ guildId: interaction.guildId });
              const configData = {
                guildId: interaction.guildId,
                guildName: interaction.guild.name,
                partnershipChannelId: selectedPartnershipChannel,
                staffRoleId: selectedRole,
                logChannelId: selectedLogChannel,
                isConfigured: true,
                configuredAt: new Date(),
                configuredBy: interaction.user.id
              };

              if (!guildConfig) {
                guildConfig = new GuildConfig(configData);
              } else {
                Object.assign(guildConfig, configData);
              }

              await guildConfig.save();
              errorLogger.logInfo('INFO', 'Configurazione salvata con successo', 'CONFIG_SAVED');

              const successEmbed = new EmbedBuilder()
                .setColor('#43b581')
                .setTitle('✅ Configurazione Completata')
                .setDescription('Il sistema è pronto all\'uso!')
                .addFields(
                  { name: '📢 Partnership', value: `<#${selectedPartnershipChannel}>`, inline: true },
                  { name: '🛡️ Staff', value: `<@&${selectedRole}>`, inline: true },
                  { name: '📜 Logs', value: `<#${selectedLogChannel}>`, inline: true }
                )
                .setTimestamp();

              await interaction.editReply({
                embeds: [successEmbed],
                components: []
              });
            } catch (saveErr) {
              errorLogger.logError('ERROR', 'Errore nel salvataggio', 'PARTNERSHIP_UPDATE_FAILED', saveErr);
              await interaction.editReply({ content: '❌ Errore nel salvataggio.', components: [] });
            }
          }
        } catch (collectorErr) {
          errorLogger.logError('ERROR', 'Errore nel collector', 'MENU_INTERACTION_FAILED', collectorErr);
        }
      });

      collector.on('end', (collected, reason) => {
        if (reason === 'time' && (!selectedPartnershipChannel || !selectedRole || !selectedLogChannel)) {
          interaction.editReply({
            content: '⏱️ Tempo scaduto. Configurazione annullata.',
            components: []
          }).catch(() => { });
        }
      });

    } catch (error) {
      errorLogger.logError('CRITICAL', 'Errore setup', 'COMMAND_EXECUTION_FAILED', error);
      await interaction.editReply({ content: '❌ Errore critico.' });
    }
  }
};
