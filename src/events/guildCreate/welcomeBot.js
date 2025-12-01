const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const GuildConfig = require('../../database/guildConfigSchema');

module.exports = {
  name: 'guildCreate',
  async execute(guild) {
    try {
      const owner = await guild.fetchOwner();

      // 1. Welcome Embed
      const welcomeEmbed = new EmbedBuilder()
        .setColor(0x5865F2) // Discord Blurple
        .setTitle('🚀 Grazie per aver aggiunto MinfoAI!')
        .setDescription(
          `Ciao **${owner.user.username}**! Sono **MinfoAI**, il tuo nuovo assistente per la gestione delle partnership e del server.\n\n` +
          `Sono qui per automatizzare le tue partnership, gestire l'economia e aiutarti con l'intelligenza artificiale.`
        )
        .setThumbnail(guild.client.user.displayAvatarURL())
        .addFields(
          { name: '⚡ Setup Rapido', value: 'Per iniziare, usa il comando `/setup` nel tuo server. Configurerai canali e ruoli in pochi secondi.', inline: false }
        );

      // 2. Features Embed
      const featuresEmbed = new EmbedBuilder()
        .setColor(0x00F0FF) // Cyan
        .setTitle('✨ Funzionalità Principali')
        .addFields(
          { name: '🤝 Auto-Partnership', value: 'Gestisco automaticamente le richieste di partnership, posto gli annunci e aggiorno i contatori.', inline: true },
          { name: '💰 Economia Globale', value: 'Sistema di monete, shop, daily rewards e classifiche globali tra tutti i server.', inline: true },
          { name: '🤖 AI Assistant', value: 'Rispondo alle domande degli utenti e fornisco supporto intelligente 24/7.', inline: true },
          { name: '📊 Statistiche', value: 'Traccio la crescita del server e fornisco insight dettagliati.', inline: true }
        )
        .setFooter({ text: 'MinfoAI v2.0 • Advanced Server Automation' });

      // 3. Action Buttons
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Guida Setup')
          .setStyle(ButtonStyle.Link)
          .setURL('https://github.com/Fl4chi/MinfoAI-2.0#setup')
          .setEmoji('📚'),

        new ButtonBuilder()
          .setLabel('Dashboard Web')
          .setStyle(ButtonStyle.Link)
          .setURL('http://localhost:3001') // TODO: Change to public URL in prod
          .setEmoji('🌐'),

        new ButtonBuilder()
          .setLabel('Supporto')
          .setStyle(ButtonStyle.Link)
          .setURL('https://discord.gg/rhE8CsF8Fs')
          .setEmoji('🆘')
      );

      await owner.send({
        content: `👋 Ciao! Ho notato che mi hai aggiunto a **${guild.name}**. Ecco cosa posso fare per te:`,
        embeds: [welcomeEmbed, featuresEmbed],
        components: [row],
      }).catch(err => {
        console.warn(`Could not send welcome DM to ${owner.user.tag}: ${err.message}`);
        // Fallback: Try sending to the system channel or first available channel
        if (guild.systemChannel && guild.systemChannel.permissionsFor(guild.members.me).has('SendMessages')) {
          guild.systemChannel.send({
            content: `👋 Ciao **${guild.name}**! Grazie per avermi invitato.\n(Non sono riuscito a inviare un DM all'owner, quindi scrivo qui)`,
            embeds: [welcomeEmbed, featuresEmbed],
            components: [row]
          }).catch(console.error);
        }
      });

    } catch (error) {
      console.error(`Guild create event error: ${error.message}`);
    }
  },
};
