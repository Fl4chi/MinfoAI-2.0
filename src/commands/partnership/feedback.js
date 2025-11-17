const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const PartnershipAI = require('../../database/partnershipAISchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partner-feedback')
    .setDescription('Lascia feedback sulla partnership con analisi AI')
    .addStringOption(option =>
      option.setName('partnership-id')
        .setDescription('ID della partnership')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('rating')
        .setDescription('Voto da 1 a 5')
        .setMinValue(1)
        .setMaxValue(5)
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('comment')
        .setDescription('Commento opzionale')
        .setRequired(false)
    ),
  async execute(interaction) {
    try {
      const partnershipId = interaction.options.getString('partnership-id');
      const rating = interaction.options.getInteger('rating');
      const comment = interaction.options.getString('comment') || '';
      await interaction.deferReply();

      const aiData = await PartnershipAI.findOne({ partnershipId });
      if (!aiData) {
        return interaction.editReply('❌ Dati AI non trovati');
      }

      // Analizza sentiment del commento
      const sentiment = analyzeSentiment(comment);
      
      // Salva feedback
      aiData.feedback.rating = rating;
      aiData.feedback.sentiment = sentiment;
      aiData.feedback.lastFeedbackDate = new Date();
      aiData.feedback.comments = aiData.feedback.comments || [];
      aiData.feedback.comments.push({
        text: comment,
        rating,
        date: new Date(),
        sentiment
      });
      
      await aiData.save();

      const embed = new EmbedBuilder()
        .setColor(getRatingColor(rating))
        .setTitle('💬 Partnership Feedback')
        .addFields(
          { name: 'Voto', value: `${'⭐'.repeat(rating)} ${rating}/5`, inline: true },
          { name: 'Sentiment', value: sentiment === 'positive' ? '😀Positivo' : sentiment === 'negative' ? '😣Negativo' : '😐Neutro', inline: true }
        );
      
      if (comment) {
        embed.addFields({ name: 'Commento', value: comment.substring(0, 100), inline: false });
      }
      
      embed.addFields(
        { name: 'Info', value: `Voti ricevuti: ${aiData.feedback.comments.length}`, inline: false }
      );
      
      embed.setFooter({ text: 'FASE 2 - Feedback System' });
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Feedback error:', error);
      await interaction.editReply('❌ Errore nel salvare il feedback');
    }
  }
};

function analyzeSentiment(text) {
  if (!text) return 'neutral';
  text = text.toLowerCase();
  const positive = ['bene', 'ottimo', 'fantastico', 'eccellente', 'grande', 'super', 'perfetto', 'bellissimo'];
  const negative = ['male', 'terribile', 'brutto', 'pessimo', 'orribile', 'cattivo', 'scarso'];
  
  const posCount = positive.filter(word => text.includes(word)).length;
  const negCount = negative.filter(word => text.includes(word)).length;
  
  if (posCount > negCount) return 'positive';
  if (negCount > posCount) return 'negative';
  return 'neutral';
}

function getRatingColor(rating) {
  const colors = { 5: '#2ecc71', 4: '#3498db', 3: '#f39c12', 2: '#e67e22', 1: '#e74c3c' };
  return colors[rating] || '#95a5a6';
}
