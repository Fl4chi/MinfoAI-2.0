const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnership-reject')
    .setDescription('Rifiuta una richiesta di partnership')
    .addStringOption(option =>
      option.setName('partnership-id')
        .setDescription('ID della partnership da rifiutare')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Motivo del rifiuto')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const partnershipId = interaction.options.getString('partnership-id');
    const reason = interaction.options.getString('reason') || 'Nessun motivo specificato';

    try {
      const partnership = await Partnership.findOne({ partnershipId, status: 'pending' });

      if (!partnership) {
        return interaction.editReply({
          content: '❌ Partnership non trovata o già approvata/rifiutata!',
        });
      }

      partnership.status = 'rejected';
      partnership.rejectionReason = reason;
      await partnership.save();

      const embed = CustomEmbedBuilder.error(
        'Partnership Rifiutata',
        `❌ La partnership con **${partnership.primaryGuild.guildName}** è stata rifiutata.\n\n**Motivo:** ${reason}`
      );

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error rejecting partnership:', error);
      await interaction.editReply({
        content: '❌ Errore durante il rifiuto. Riprova.',
      });
    }
  }
};
