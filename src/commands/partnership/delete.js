const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnership-delete')
    .setDescription('Elimina una partnership')
    .addStringOption(option =>
      option.setName('partnership-id')
        .setDescription('ID della partnership da eliminare')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const partnershipId = interaction.options.getString('partnership-id');

    try {
      const partnership = await Partnership.findOneAndDelete({ partnershipId });

      if (!partnership) {
        return interaction.editReply({ content: '❌ Partnership non trovata!' });
      }

      const embed = CustomEmbedBuilder.success(
        '🗑️ Partnership Eliminata',
        `La partnership con **${partnership.primaryGuild.guildName}** è stata eliminata definitivamente.`
      );

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error deleting partnership:', error);
      await interaction.editReply({ content: '❌ Errore durante l\'eliminazione.' });
    }
  }
};
