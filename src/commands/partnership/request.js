const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnership-request')
    .setDescription('Richiedi una partnership con questo server')
    .addStringOption(option =>
      option.setName('server-name')
        .setDescription('Nome del tuo server')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('invite-link')
        .setDescription('Link di invito permanente del tuo server')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Breve descrizione del tuo server')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const serverName = interaction.options.getString('server-name');
    const inviteLink = interaction.options.getString('invite-link');
    const description = interaction.options.getString('description');

    try {
      // Check if partnership already exists
      const existing = await Partnership.findOne({
        $or: [
          { 'primaryGuild.guildId': interaction.guildId },
          { 'secondaryGuild.guildId': interaction.guildId }
        ]
      });

      if (existing) {
        return interaction.editReply({
          content: '❌ Esiste già una partnership con questo server!',
        });
      }

      // Create new partnership request
      const partnershipId = uuidv4();
      const newPartnership = new Partnership({
        partnershipId,
        primaryGuild: {
          guildId: interaction.guildId,
          guildName: serverName,
          guildIcon: interaction.guild.iconURL(),
          ownerUserId: interaction.user.id,
          ownerUsername: interaction.user.tag,
          memberCount: interaction.guild.memberCount,
          description: description,
          inviteLink: inviteLink
        },
        status: 'pending',
        requestedBy: interaction.user.id,
        tier: 'bronze'
      });

      await newPartnership.save();

      const embed = CustomEmbedBuilder.success(
        'Partnership Richiesta',
        `✅ La tua richiesta di partnership è stata inviata!\n\n**Server:** ${serverName}\n**ID Richiesta:** \`${partnershipId}\`\n\nAttendi l'approvazione da uno staff.`
      );

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error creating partnership request:', error);
      await interaction.editReply({
        content: '❌ Errore durante la creazione della richiesta. Riprova.',
      });
    }
  }
};
