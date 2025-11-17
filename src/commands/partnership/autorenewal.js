const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const PartnershipAI = require('../../database/partnershipAISchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partner-autorenewal')
    .setDescription('Abilita/Disabilita il rinnovo automatico della partnership')
    .addStringOption(option =>
      option.setName('partnership-id')
        .setDescription('ID della partnership')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('enable')
        .setDescription('Abilitare o disabilitare rinnovo')
        .addChoices({ name: 'On', value: 'on' }, { name: 'Off', value: 'off' })
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      const partnershipId = interaction.options.getString('partnership-id');
      const enable = interaction.options.getString('enable') === 'on';
      await interaction.deferReply();

      const aiData = await PartnershipAI.findOne({ partnershipId });
      if (!aiData) {
        return interaction.editReply('❌ Dati AI non trovati');
      }

      aiData.autoRenewal.enabled = enable;
      if (enable) {
        aiData.autoRenewal.nextRenewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        aiData.autoRenewal.renewalHistory = aiData.autoRenewal.renewalHistory || [];
      }
      await aiData.save();

      const embed = new EmbedBuilder()
        .setColor(enable ? '#2ecc71' : '#e74c3c')
        .setTitle('🔄 Auto-Renewal Settings')
        .addFields(
          { name: 'Stato', value: enable ? '🔊Abilitato' : '❌Disabilitato', inline: true },
          { name: 'Partnership ID', value: partnershipId, inline: true }
        );

      if (enable) {
        embed.addFields(
          { name: 'Prossimo Rinnovo', value: `<t:${Math.floor(new Date(aiData.autoRenewal.nextRenewalDate).getTime() / 1000)}:R>`, inline: true },
          { name: 'Info', value: 'Notifica 14 giorni prima della scadenza', inline: false }
        );
      } else {
        embed.addFields({ name: 'Avviso', value: 'Rinnovo automatico disabilitato', inline: false });
      }

      embed.setFooter({ text: 'FASE 2 - Auto-Renewal System' });
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('AutoRenewal error:', error);
      await interaction.editReply('❌ Errore nell\'aggiornare il rinnovo');
    }
  }
};
