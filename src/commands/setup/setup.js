const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags } = require('discord.js');
const GuildConfig = require('../../database/guildConfigSchema');
const errorLogger = require('../../utils/errorLogger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('🔧 Configura il sistema partnership e il profilo del server')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    // Initial defer
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      // --- Step 1: Fetch Channels & Roles ---
      const channels = interaction.guild.channels.cache
        .filter(ch => ch.isTextBased() && ch.type === 0)
        .map(ch => ({ label: `#${ch.name}`, value: ch.id }))
        .slice(0, 25);

      const roles = interaction.guild.roles.cache
        .filter(role => role.id !== interaction.guild.id)
        .sort((a, b) => b.position - a.position)
        .map(role => ({ label: role.name, value: role.id }))
        .slice(0, 25);

      if (channels.length === 0 || roles.length === 0) {
        return interaction.editReply({ content: '❌ Impossibile trovare canali o ruoli sufficienti.' });
      }

      // --- Step 2: Build UI Components ---
      const embed = new EmbedBuilder()
        .setColor('#00F0FF')
        .setTitle('🚀 Configurazione MinfoAI')
        .setDescription(
          'Benvenuto! Per attivare l\'automazione, devi configurare i canali e il profilo del tuo server.\n\n' +
          '**1️⃣ Configurazione Base:** Seleziona Canali e Ruoli.\n' +
          '**2️⃣ Profilo Server:** Clicca il bottone per inserire Descrizione e Link.\n' +
          '**3️⃣ Conferma:** Salva tutto per attivare l\'Auto-Partnership.'
        )
        .setFooter({ text: 'MinfoAI Automation System' });

      const channelMenu = new StringSelectMenuBuilder()
        .setCustomId('setup_partnership_channel')
        .setPlaceholder('📢 Canale Partnership')
        .addOptions(channels);

      const roleMenu = new StringSelectMenuBuilder()
        .setCustomId('setup_staff_role')
        .setPlaceholder('🛡️ Ruolo Addetto Partnership')
        .addOptions(roles);

      const logMenu = new StringSelectMenuBuilder()
        .setCustomId('setup_log_channel')
        .setPlaceholder('📜 Canale Logs')
        .addOptions(channels);

      const profileButton = new ButtonBuilder()
        .setCustomId('setup_profile_modal')
        .setLabel('📝 Configura Profilo Server')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📝');

      const saveButton = new ButtonBuilder()
        .setCustomId('setup_save_all')
        .setLabel('✅ Salva e Attiva')
        .setStyle(ButtonStyle.Success)
        .setDisabled(true); // Disabled until profile is set

      const row1 = new ActionRowBuilder().addComponents(channelMenu);
      const row2 = new ActionRowBuilder().addComponents(roleMenu);
      const row3 = new ActionRowBuilder().addComponents(logMenu);
      const row4 = new ActionRowBuilder().addComponents(profileButton, saveButton);

      const response = await interaction.editReply({
        embeds: [embed],
        components: [row1, row2, row3, row4]
      });

      // --- Step 3: Collector Logic ---
      const collector = response.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        time: 300000 // 5 minutes
      });

      // State
      let config = {
        partnershipChannelId: null,
        staffRoleId: null,
        logChannelId: null,
        serverProfile: {
          description: null,
          inviteLink: null,
          tags: []
        }
      };

      collector.on('collect', async (i) => {
        try {
          // Update Config State
          if (i.customId === 'setup_partnership_channel') {
            config.partnershipChannelId = i.values[0];
            await i.deferUpdate();
          }
          else if (i.customId === 'setup_staff_role') {
            config.staffRoleId = i.values[0];
            await i.deferUpdate();
          }
          else if (i.customId === 'setup_log_channel') {
            config.logChannelId = i.values[0];
            await i.deferUpdate();
          }
          else if (i.customId === 'setup_profile_modal') {
            // Check if channels/roles are selected first
            if (!config.partnershipChannelId || !config.staffRoleId || !config.logChannelId) {
              return i.reply({ content: '⚠️ **Attenzione:** Seleziona prima i Canali e il Ruolo Staff per procedere!', flags: MessageFlags.Ephemeral });
            }

            // Show Modal
            const modal = new ModalBuilder()
              .setCustomId('setup_modal_submission')
              .setTitle('📝 Profilo Server');

            const descInput = new TextInputBuilder()
              .setCustomId('profile_description')
              .setLabel('Descrizione Server (Max 1000)')
              .setStyle(TextInputStyle.Paragraph)
              .setMaxLength(1000)
              .setRequired(true);

            const linkInput = new TextInputBuilder()
              .setCustomId('profile_invite')
              .setLabel('Link Invito (es. discord.gg/...)')
              .setStyle(TextInputStyle.Short)
              .setRequired(true);

            const tagsInput = new TextInputBuilder()
              .setCustomId('profile_tags')
              .setLabel('Tags (es. Gaming, Anime)')
              .setStyle(TextInputStyle.Short)
              .setRequired(true);

            const mRow1 = new ActionRowBuilder().addComponents(descInput);
            const mRow2 = new ActionRowBuilder().addComponents(linkInput);
            const mRow3 = new ActionRowBuilder().addComponents(tagsInput);

            modal.addComponents(mRow1, mRow2, mRow3);

            await i.showModal(modal);

            try {
              const modalSubmit = await i.awaitModalSubmit({ time: 300000, filter: m => m.user.id === interaction.user.id });

              const desc = modalSubmit.fields.getTextInputValue('profile_description');
              const link = modalSubmit.fields.getTextInputValue('profile_invite');
              const tagsRaw = modalSubmit.fields.getTextInputValue('profile_tags');

              // Robust Validation
              if (!link || (!link.includes('discord.gg') && !link.includes('discord.com/invite'))) {
                await modalSubmit.reply({ content: '❌ **Errore Link:** Inserisci un link valido (es. `https://discord.gg/esempio`).', flags: MessageFlags.Ephemeral });
                return;
              }

              config.serverProfile.description = desc;
              config.serverProfile.inviteLink = link;
              config.serverProfile.tags = tagsRaw.split(',').map(t => t.trim()).filter(t => t.length > 0);

              // Update Embed to show progress
              const updatedEmbed = EmbedBuilder.from(embed)
                .spliceFields(0, 25) // Clear fields
                .addFields(
                  { name: '📢 Canale Partnership', value: config.partnershipChannelId ? `<#${config.partnershipChannelId}>` : '❌ Non selezionato', inline: true },
                  { name: '🛡️ Ruolo Staff', value: config.staffRoleId ? `<@&${config.staffRoleId}>` : '❌ Non selezionato', inline: true },
                  { name: '📜 Canale Log', value: config.logChannelId ? `<#${config.logChannelId}>` : '❌ Non selezionato', inline: true },
                  { name: '📝 Profilo', value: `✅ Configurato\n**Link:** ${link}`, inline: false }
                );

              // Enable Save Button ONLY if everything is set
              if (config.partnershipChannelId && config.staffRoleId && config.logChannelId && config.serverProfile.description) {
                saveButton.setDisabled(false);
                saveButton.setLabel('✅ Salva e Attiva');
              }

              await modalSubmit.update({ embeds: [updatedEmbed], components: [row1, row2, row3, row4] });

            } catch (modalErr) {
              if (modalErr.code !== 'InteractionCollectorError') {
                errorLogger.logError('WARNING', 'Modal Error', 'MODAL_FAIL', modalErr);
              }
            }
          }
          else if (i.customId === 'setup_save_all') {
            // Final Validation
            if (!config.partnershipChannelId || !config.staffRoleId || !config.logChannelId || !config.serverProfile.description) {
              return i.reply({ content: '❌ Compila tutti i campi prima di salvare!', flags: MessageFlags.Ephemeral });
            }

            await i.deferUpdate();

            // Save to DB
            let guildConfig = await GuildConfig.findOne({ guildId: interaction.guildId });
            const updateData = {
              guildId: interaction.guildId,
              guildName: interaction.guild.name,
              partnershipChannelId: config.partnershipChannelId,
              staffRoleId: config.staffRoleId,
              logChannelId: config.logChannelId,
              serverProfile: {
                description: config.serverProfile.description,
                inviteLink: config.serverProfile.inviteLink,
                tags: config.serverProfile.tags,
                memberCount: interaction.guild.memberCount,
                iconUrl: interaction.guild.iconURL(),
                lastPostDate: new Date()
              },
              isConfigured: true,
              configuredAt: new Date(),
              configuredBy: interaction.user.id
            };

            if (!guildConfig) {
              guildConfig = new GuildConfig(updateData);
            } else {
              Object.assign(guildConfig, updateData);
            }

            await guildConfig.save();
            collector.stop('saved');

            const successEmbed = new EmbedBuilder()
              .setColor('#43b581')
              .setTitle('✅ Setup Completato!')
              .setDescription('**MinfoAI è attivo!**\nL\'Auto-Partnership inizierà a lavorare in background.')
              .addFields(
                { name: 'Configurazione', value: `📢 <#${config.partnershipChannelId}>\n🛡️ <@&${config.staffRoleId}>\n📜 <#${config.logChannelId}>`, inline: true }
              );

            await interaction.editReply({ embeds: [successEmbed], components: [] });
          }

          // Dynamic UI Update for Select Menus (if not modal/save)
          if (['setup_partnership_channel', 'setup_staff_role', 'setup_log_channel'].includes(i.customId)) {
            // Re-render embed to show selections
            const updatedEmbed = EmbedBuilder.from(embed)
              .spliceFields(0, 25)
              .addFields(
                { name: '📢 Canale Partnership', value: config.partnershipChannelId ? `<#${config.partnershipChannelId}>` : '❌ Non selezionato', inline: true },
                { name: '🛡️ Ruolo Staff', value: config.staffRoleId ? `<@&${config.staffRoleId}>` : '❌ Non selezionato', inline: true },
                { name: '📜 Canale Log', value: config.logChannelId ? `<#${config.logChannelId}>` : '❌ Non selezionato', inline: true }
              );

            if (config.serverProfile.description) {
              updatedEmbed.addFields({ name: '📝 Profilo', value: '✅ Configurato', inline: false });
            }

            await interaction.editReply({ embeds: [updatedEmbed] });
          }

        } catch (err) {
          errorLogger.logError('ERROR', 'Interaction Error in Setup', 'SETUP_INTERACTION_ERROR', err);
        }
      });

    } catch (error) {
      errorLogger.logError('CRITICAL', 'Setup Command Failed', 'SETUP_FAILED', error);
      await interaction.editReply({ content: '❌ Errore critico nel setup.' });
    }
  }
};
