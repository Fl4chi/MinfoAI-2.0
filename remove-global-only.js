/**
 * Script per rimuovere SOLO i comandi GLOBALI
 * Mantiene i comandi guild per testing rapido
 */

const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('\x1b[33m🗑️  Rimozione comandi GLOBALI (lasciando quelli guild)...\x1b[0m\n');

        // Rimuovi SOLO comandi global
        console.log('\x1b[36m🌍 Rimozione comandi global...\x1b[0m');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [] }
        );
        console.log('\x1b[32m✅ Comandi global rimossi con successo\x1b[0m\n');

        console.log('\x1b[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
        console.log('\x1b[32m✅ Fatto! I comandi guild rimangono attivi.\x1b[0m');
        console.log('\x1b[33m🔄 Riavvia Discord per vedere l\'effetto.\x1b[0m');
        console.log('\x1b[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');

    } catch (error) {
        console.error('\x1b[31m❌ Errore durante la rimozione:\x1b[0m', error);
        process.exit(1);
    }
})();
