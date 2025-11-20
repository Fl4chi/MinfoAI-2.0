const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const GuildConfig = require('../../database/guildConfigSchema');

module.exports = {
  name: 'guildCreate',
  async execute(guild) {
    try {
      const owner = await guild.fetchOwner();

      const welcomeEmbed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Benvenuto in MinfoAI!')
        .setDescription('Grazie per aver aggiunto MinfoAI al tuo server!')
        .addFields(
          { name: 'Bot Partnership Manager', value: 'Gestisci le partnership in modo semplice e intuitivo', inline: false },
          { name: 'Prossimo Passo', value: 'Un Admin deve eseguire il comando `/setup` per configurare il bot', inline: false },
          { name: 'Permessi Necessari', value: '- Gestire canali\n- Menzione di ruoli\n- Leggere messaggi', inline: false }
        )
        .setFooter({ text: 'MinfoAI • Partnership Manager' });

      const setupButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Guida Setup')
          .setStyle(ButtonStyle.Link)
          .setURL('https://github.com/Fl4chi/MinfoAI-2.0#setup')
      );

      await owner.send({
        embeds: [welcomeEmbed],
        components: [setupButton],
      }).catch(() => {
        // Silent fail if DM closed
      });

    } catch (error) {
      console.error(`Guild create event error: ${error.message}`);
    }
  },
};
