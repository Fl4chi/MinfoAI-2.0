const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const PartnershipAI = require('../../database/partnershipAISchema');
const Partnership = require('../../database/partnershipSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partner-tier')
    .setDescription('Mostra il tier della partnership e controlla upgrade')
    .addStringOption(option =>
      option.setName('partnership-id')
        .setDescription('ID della partnership da controllare')
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      const partnershipId = interaction.options.getString('partnership-id');
      await interaction.deferReply();

      // Cerca i dati AI della partnership
      const aiData = await PartnershipAI.findOne({ partnershipId });
      if (!aiData) {
        return interaction.editReply('❌ Dati AI non trovati');
      }

      // Verifica eligibilità per upgrade
      const canUpgrade = checkUpgradeEligibility(aiData);
      if (canUpgrade.eligible) {
        aiData.tier.level = canUpgrade.newTier;
        aiData.tier.earnedAt = new Date();
        aiData.tier.upgradeNextCheck = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await aiData.save();
      }

      const embed = new EmbedBuilder()
        .setColor(getTierColor(aiData.tier.level))
        .setTitle('🎬 Partnership Tier System')
        .addFields(
          { name: 'Tier Attuale', value: `**${aiData.tier.level.toUpperCase()}**`, inline: true },
          { name: 'Engagement', value: `${aiData.healthMetrics.engagement}%`, inline: true },
          { name: 'Activity', value: `${aiData.healthMetrics.activity}%`, inline: true }
        );

      if (canUpgrade.eligible) {
        embed.addFields({ name: '🌟 Upgrade!', value: `Promosso a **${canUpgrade.newTier.toUpperCase()}**!`, inline: false });
      } else {
        embed.addFields({ name: 'Requisiti', value: buildUpgradeRequirements(aiData), inline: false });
      }

      embed.setFooter({ text: 'FASE 2 - Tier Management' });
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Tier error:', error);
      await interaction.editReply('❌ Errore nel tier command');
    }
  }
};

function checkUpgradeEligibility(aiData) {
  const tier = aiData.tier.level;
  const eng = aiData.healthMetrics.engagement || 0;
  const act = aiData.healthMetrics.activity || 0;
  
  if (tier === 'bronze' && eng > 75) {
    return { eligible: true, newTier: 'silver' };
  }
  
  if (tier === 'silver') {
    const months = Math.floor((Date.now() - new Date(aiData.tier.earnedAt)) / (30 * 24 * 60 * 60 * 1000));
    const rating = aiData.feedback.rating || 0;
    if (months >= 3 && rating >= 4.5 && eng > 85) {
      return { eligible: true, newTier: 'gold' };
    }
  }
  
  return { eligible: false };
}

function getTierColor(tier) {
  const colors = { bronze: '#CD7F32', silver: '#C0C0C0', gold: '#FFD700' };
  return colors[tier] || '#95a5a6';
}

function buildUpgradeRequirements(aiData) {
  if (aiData.tier.level === 'bronze') {
    const eng = aiData.healthMetrics.engagement || 0;
    return `📊 Engagement: ${eng}/75% ${eng >= 75 ? '✅' : '⚠️'}`;
  }
  if (aiData.tier.level === 'silver') {
    const months = Math.floor((Date.now() - new Date(aiData.tier.earnedAt)) / (30 * 24 * 60 * 60 * 1000));
    const rating = aiData.feedback.rating || 0;
    const eng = aiData.healthMetrics.engagement || 0;
    return `📅 Mesi: ${months}/3\n⭐ Rating: ${rating}/5\n📊 Engagement: ${eng}% (min 85%)`;
  }
  return 'Upgrade non disponibile';
}
