const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnership-approve')
    .setDescription('Approva una richiesta di partnership')
    .addStringOption(option =>
      option.setName('partnership-id')
        .setDescription('ID della partnership da approvare')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const partnershipId = interaction.options.getString('partnership-id');

    try {
      const partnership = await Partnership.findOne({ partnershipId, status: 'pending' });

      if (!partnership) {
        return interaction.editReply({
          content: '❌ Partnership non trovata o già approvata/rifiutata!',
        });
      }

      partnership.status = 'active';
      partnership.approvedBy = interaction.user.id;
      await partnership.save();

      const embed = CustomEmbedBuilder.success(
        'Partnership Approvata',
        `✅ La partnership con **${partnership.primaryGuild.guildName}** è stata approvata!`
      );

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error approving partnership:', error);
      await interaction.editReply({
        content: '❌ Errore durante l\'approvazione. Riprova.',
      });
    }
  }
};
