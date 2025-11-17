const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const PartnershipAI = require('../../database/partnershipAISchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partner-recommend')
    .setDescription('Ottieni raccomandazioni AI per partnership complementari')
    .addStringOption(option =>
      option.setName('partnership-id')
        .setDescription('ID della partnership da analizzare')
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      const partnershipId = interaction.options.getString('partnership-id');
      await interaction.deferReply();

      // Cerca la partnership
      const partnership = await Partnership.findById(partnershipId);
      if (!partnership) {
        return interaction.editReply('❌ Partnership non trovata');
      }

      // Cerca i dati AI della partnership
      const aiData = await PartnershipAI.findOne({ partnershipId });
      if (!aiData) {
        return interaction.editReply('❌ Dati AI non disponibili per questa partnership');
      }

      // Calcola compatibility score con le altre partnerships
      const allPartnerships = await Partnership.find();
      const scores = [];

      for (const other of allPartnerships) {
        if (other._id.toString() === partnershipId) continue;

        // Analisi compatibility
        const compatibility = calculateCompatibility(partnership, other);
        scores.push({ partnership: other, score: compatibility });
      }

      // Ordina per score e prendi i top 3
      scores.sort((a, b) => b.score - a.score);
      const topRecommendations = scores.slice(0, 3);

      // Crea l'embed con le raccomandazioni
      const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setTitle('🤖 Raccomandazioni Partnership AI')
        .setDescription(`Partner analysis per: **${partnership.serverName}**`)
        .setFooter({ text: 'FASE 2 - AI Partner Recommendations' });

      if (topRecommendations.length === 0) {
        embed.addFields({ name: '⚠️ Nessuna raccomandazione', value: 'Non ci sono partnership compatibili al momento' });
      } else {
        topRecommendations.forEach((rec, index) => {
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
          embed.addFields({
            name: `${medal} #${index + 1} - ${rec.partnership.serverName}`,
            value: `Compatibilità: **${rec.score.toFixed(1)}%**\nMembers: ${rec.partnership.memberCount || 'N/A'}\nTipo: ${rec.partnership.serverType || 'N/A'}`,
            inline: false
          });
        });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Recommend command error:', error);
      await interaction.editReply('❌ Errore nel recuperare le raccomandazioni');
    }
  }
};

function calculateCompatibility(partnership1, partnership2) {
  let score = 50; // Base score

  // Evita competitori diretti
  if (partnership1.serverType === partnership2.serverType) {
    score -= 20;
  } else {
    score += 15; // Bonus per diversità
  }

  // Considera la dimensione del server
  const memberDiff = Math.abs((partnership1.memberCount || 0) - (partnership2.memberCount || 0));
  if (memberDiff < 5000) score += 10; // Simili dimensioni = bonus

  // Categorie complementari
  const categories1 = (partnership1.categories || []).map(c => c.toLowerCase());
  const categories2 = (partnership2.categories || []).map(c => c.toLowerCase());
  const overlap = categories1.filter(c => categories2.includes(c)).length;
  
  if (overlap > 0) score += overlap * 5;
  
  return Math.min(100, Math.max(0, score));
}
