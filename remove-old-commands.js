/**
 * Script per rimuovere TUTTI i comandi slash (guild e global)
 * Utile per fare "pulizia" prima di un nuovo deploy
 */

const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('\x1b[33m🗑️  Rimozione comandi vecchi in corso...\x1b[0m\n');

        // Rimuovi comandi guild (se GUILD_ID è configurato)
        if (process.env.GUILD_ID) {
            console.log('\x1b[36m📍 Rimozione comandi guild...\x1b[0m');
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: [] }
            );
            console.log('\x1b[32m✅ Comandi guild rimossi con successo\x1b[0m\n');
        }

        // Rimuovi comandi global
        console.log('\x1b[36m🌍 Rimozione comandi global...\x1b[0m');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [] }
        );
        console.log('\x1b[32m✅ Comandi global rimossi con successo\x1b[0m\n');

        console.log('\x1b[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
        console.log('\x1b[32m✅ Pulizia completata!\x1b[0m');
        console.log('\x1b[33m🔄 Ora esegui: node deploy-commands.js\x1b[0m');
        console.log('\x1b[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');

    } catch (error) {
        console.error('\x1b[31m❌ Errore durante la rimozione:\x1b[0m', error);
        process.exit(1);
    }
})();
