const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Partnership = require('../../database/partnershipSchema');
const CustomEmbedBuilder = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnership-report')
    .setDescription('Genera un report dettagliato delle partnership')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const allPartnerships = await Partnership.find().sort({ createdAt: -1 });
      
      if (allPartnerships.length === 0) {
        return interaction.editReply({ content: '📊 Nessuna partnership trovata per generare il report.' });
      }

      // Statistiche rapide
      const totalActive = allPartnerships.filter(p => p.status === 'active').length;
      const totalPending = allPartnerships.filter(p => p.status === 'pending').length;
      const totalRejected = allPartnerships.filter(p => p.status === 'rejected').length;

      // Calcola media trust score
      const avgTrustScore = allPartnerships.reduce((sum, p) => sum + (p.trustScore || 50), 0) / allPartnerships.length;

      const embed = CustomEmbedBuilder.info(
        '📊 Report Partnership Completo',
        `Generato il ${new Date().toLocaleDateString('it-IT')}`
      )
        .addFields(
          { name: '📊 Totale Partnership', value: allPartnerships.length.toString(), inline: true },
          { name: '✅ Attive', value: totalActive.toString(), inline: true },
          { name: '⏳ In Attesa', value: totalPending.toString(), inline: true },
          { name: '❌ Rifiutate', value: totalRejected.toString(), inline: true },
          { name: '🎯 Trust Score Medio', value: avgTrustScore.toFixed(1), inline: true },
          { name: '\u200b', value: '\u200b', inline: true }
        );

      // Aggiungi le ultime 5 partnership
      const recentPartnerships = allPartnerships.slice(0, 5);
      let recentList = '';
      recentPartnerships.forEach((p, i) => {
        const statusEmoji = p.status === 'active' ? '✅' : p.status === 'pending' ? '⏳' : '❌';
        recentList += `${i + 1}. ${statusEmoji} ${p.primaryGuild.guildName} (${p.tier})\n`;
      });

      embed.addFields({ name: '🕑 Ultime 5 Partnership', value: recentList || 'Nessuna', inline: false });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error generating partnership report:', error);
      await interaction.editReply({ content: '❌ Errore durante la generazione del report.' });
    }
  }
};
