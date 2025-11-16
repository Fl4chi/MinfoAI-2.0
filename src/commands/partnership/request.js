const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');
const errorLogger = require('../../utils/errorLogger');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnership-request')
    .setDescription('📬 Richiedi una partnership con questo server')
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
        errorLogger.logWarn('WARNING', `Partnership already exists for guild ${interaction.guildId}`, 'PARTNERSHIP_ALREADY_EXISTS');
        const embed = CustomEmbedBuilder.error('❌ Errore', 'Una partnership è già in corso per questo server.');
        return interaction.editReply({ embeds: [embed] });
      }

      // Create partnership request
      const partnership = new Partnership({
        id: uuidv4(),
        status: 'pending',
        primaryGuild: {
          guildId: interaction.guildId,
          guildName: interaction.guild.name,
          serverName: serverName,
          inviteLink: inviteLink,
          description: description,
          userId: interaction.user.id
        },
        createdAt: new Date()
      });

      await partnership.save();
      errorLogger.logInfo('INFO', `Partnership request created: ${partnership.id}`, 'PARTNERSHIP_REQUEST_CREATED');

      const embed = CustomEmbedBuilder.success('✅ Richiesta Inviata', 
        `La tua richiesta di partnership per **${serverName}** è stata inviata con successo.\n\n` +
        `ID Richiesta: \`${partnership.id}\`\n` +
        `In attesa di approvazione...`);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      errorLogger.logError('ERROR', 'Error creating partnership request', 'PARTNERSHIP_REQUEST_FAILED', error);
      const embed = CustomEmbedBuilder.error('❌ Errore', 'Errore durante la creazione della richiesta di partnership.');
      await interaction.editReply({ embeds: [embed] });
    }
  }
};
