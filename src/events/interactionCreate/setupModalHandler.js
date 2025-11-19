const { EmbedBuilder, ActionRowBuilder, ChannelSelectMenuBuilder, RoleSelectMenuBuilder } = require('discord.js');
const GuildConfig = require('../../schemas/guildConfig');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isModalSubmit() || interaction.customId !== 'setupModal') return;

    try {
      const guildName = interaction.fields.getTextInputValue('guildName');
      await interaction.deferReply({ ephemeral: true });

      const channelSelectRow = new ActionRowBuilder().addComponents(
        new ChannelSelectMenuBuilder()
          .setCustomId('selectPartnershipChannel')
          .setPlaceholder('Seleziona il canale Partnership')
      );

      await interaction.followUp({
        embeds: [{
          color: 0x5865F2,
          title: 'Configurazione Canali',
          description: 'Seleziona il canale dove verranno pubblicate le partnership',
        }],
        components: [channelSelectRow],
        ephemeral: true,
      });

      const channelFilter = (i) => i.customId === 'selectPartnershipChannel' && i.user.id === interaction.user.id;
      const channelCollector = interaction.channel?.createMessageComponentCollector({ filter: channelFilter, time: 300000, max: 1 });

      channelCollector?.on('collect', async (i) => {
        await i.deferReply({ ephemeral: true });
        const partnershipChannelId = i.values[0];

        const logSelectRow = new ActionRowBuilder().addComponents(
          new ChannelSelectMenuBuilder()
            .setCustomId('selectLogChannel')
            .setPlaceholder('Seleziona il canale Log')
        );

        await i.followUp({
          embeds: [{
            color: 0x5865F2,
            title: 'Configurazione Canale Log',
            description: 'Seleziona il canale dove verranno pubblicati i log',
          }],
          components: [logSelectRow],
          ephemeral: true,
        });

        const logFilter = (li) => li.customId === 'selectLogChannel' && li.user.id === interaction.user.id;
        const logCollector = i.channel?.createMessageComponentCollector({ filter: logFilter, time: 300000, max: 1 });

        logCollector?.on('collect', async (li) => {
          await li.deferReply({ ephemeral: true });
          const logChannelId = li.values[0];

          const roleSelectRow = new ActionRowBuilder().addComponents(
            new RoleSelectMenuBuilder()
              .setCustomId('selectStaffRole')
              .setPlaceholder('Seleziona il ruolo Staff')
          );

          await li.followUp({
            embeds: [{
              color: 0x5865F2,
              title: 'Configurazione Ruolo Staff',
              description: 'Seleziona il ruolo dello staff',
            }],
            components: [roleSelectRow],
            ephemeral: true,
          });

          const roleFilter = (ri) => ri.customId === 'selectStaffRole' && ri.user.id === interaction.user.id;
          const roleCollector = li.channel?.createMessageComponentCollector({ filter: roleFilter, time: 300000, max: 1 });

          roleCollector?.on('collect', async (ri) => {
            await ri.deferReply({ ephemeral: true });
            const staffRoleId = ri.values[0];

            const guildConfig = await GuildConfig.findOneAndUpdate(
              { guildId: interaction.guild.id },
              {
                guildId: interaction.guild.id,
                guildName: guildName,
                partnershipChannelId: partnershipChannelId,
                logChannelId: logChannelId,
                staffRoleId: staffRoleId,
                setupComplete: true,
              },
              { upsert: true, new: true }
            );

            interaction.client.advancedLogger?.info(`Guild ${guildName} setup completed`, `Config saved to DB`);

            await ri.followUp({
              embeds: [{
                color: 0x57F287,
                title: 'Setup Completato',
                description: `Bot configurato correttamente per ${guildName}`,
                fields: [
                  { name: 'Partnership Channel', value: `<#${partnershipChannelId}>`, inline: true },
                  { name: 'Log Channel', value: `<#${logChannelId}>`, inline: true },
                  { name: 'Staff Role', value: `<@&${staffRoleId}>`, inline: true },
                ],
              }],
              ephemeral: true,
            });
          });
        });
      });

    } catch (error) {
      interaction.client.advancedLogger?.error(`Setup modal error: ${error.message}`, error.stack);
      await interaction.reply({
        content: 'Errore nella configurazione',
        ephemeral: true,
      }).catch(() => {});
    }
  },
};
