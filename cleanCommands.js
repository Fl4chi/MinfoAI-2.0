require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    console.log(`🤖 Bot connesso come ${client.user.tag}`);

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('🗑️ Eliminazione di TUTTI i comandi globali...');
        await rest.put(Routes.applicationCommands(client.user.id), { body: [] });
        console.log('✅ Comandi globali eliminati');

        console.log('🗑️ Eliminazione comandi di gilda...');
        const guilds = client.guilds.cache.map(g => g.id);
        for (const guildId of guilds) {
            await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: [] });
            console.log(`✅ Comandi eliminati per gilda: ${guildId}`);
        }

        console.log('✅ Pulizia completata! Chiusura...');
        process.exit(0);
    } catch (error) {
        console.error('❌ Errore:', error);
        process.exit(1);
    }
});

client.login(process.env.DISCORD_TOKEN);
