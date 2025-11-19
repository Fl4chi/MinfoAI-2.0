const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../schemas/guildConfig');

/**
 * Permission verification middleware for slash commands
 * Checks ADMINISTRATOR permission or staff role
 */
const permissionCheck = async (interaction) => {
  try {
    // Check if user is ADMINISTRATOR
    if (interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return true;
    }

    // Check if user has staff role from MongoDB config
    const guildConfig = await GuildConfig.findOne({ guildId: interaction.guildId });
    if (!guildConfig) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xdc2626)
        .setTitle('❌ Errore di Configurazione')
        .setDescription('Il server non è stato configurato ancora. Usa `/setup` per configurarlo.')
        .setTimestamp();
      
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return false;
    }

    // Check if staff role is set and user has it
    if (guildConfig.staffRoleId) {
      const staffRole = interaction.guild.roles.cache.get(guildConfig.staffRoleId);
      if (staffRole && interaction.member.roles.has(guildConfig.staffRoleId)) {
        return true;
      }
    }

    // No permission
    const deniedEmbed = new EmbedBuilder()
      .setColor(0xdc2626)
      .setTitle('❌ Permesso Negato')
      .setDescription('Non hai i permessi necessari per eseguire questo comando. Devi essere Administrator o avere il ruolo Staff.')
      .setTimestamp();
    
    await interaction.reply({ embeds: [deniedEmbed], ephemeral: true });
    return false;
  } catch (error) {
    console.error('Permission check error:', error);
    interaction.client.advancedLogger?.error(`Permission check failed: ${error.message}`, error.stack);
    
    const errorEmbed = new EmbedBuilder()
      .setColor(0xdc2626)
      .setTitle('❌ Errore')
      .setDescription('Si è verificato un errore durante il controllo dei permessi.')
      .setTimestamp();
    
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
    return false;
  }
};

module.exports = permissionCheck;
