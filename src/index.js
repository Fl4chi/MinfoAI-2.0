const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const logger = require('./utils/logger');
const commandHandler = require('./handlers/commandHandler');
const eventHandler = require('./handlers/eventHandler');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

// Connessione MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    logger.info('\u2705 Connesso a MongoDB con successo!');

        // Carica handlers
    await commandHandler(client);
    await eventHandler(client);

}).catch(err => {
    logger.error('\u274c Errore connessione MongoDB:', err);
    process.exit(1);
});

    
// Login bot
client.login(process.env.BOT_TOKEN).catch(err => {
    logger.error('\u274c Errore login bot:', err);
    process.exit(1);
});

// Gestione errori globali
process.on('unhandledRejection', error => {
    logger.error('\u274c Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    logger.error('\u274c Uncaught exception:', error);
    process.exit(1);
});

module.exports = client;
