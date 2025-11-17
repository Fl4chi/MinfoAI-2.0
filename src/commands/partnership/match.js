const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const PartnershipAI = require('../../database/partnershipAISchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partner-match')
    .setDescription('Trova server complementari per collaborazioni')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Categoria di server da trovare')
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      const category = interaction.options.getString('category');
      await interaction.deferReply();

      const partnerships = await Partnership.find({ categories: { $in: [category] } }).limit(5);
      
      if (partnerships.length === 0) {
        return interaction.editReply('❌ Nessun server trovato in questa categoria');
      }

      const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setTitle('🔍 Server Matching Results')
        .setDescription(`Server trovati in: **${category}**`)
        .setFooter({ text: 'FASE 2 - Server Matching' });

      partnerships.forEach((p, idx) => {
        embed.addFields({
          name: `#${idx + 1} - ${p.serverName}`,
          value: `Members: ${p.memberCount || 'N/A'} | Tier: ${p.tier || 'Bronze'}`,
          inline: false
        });
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Match error:', error);
      await interaction.editReply('❌ Errore nella ricerca');
    }
  }
};
