const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
require('dotenv').config();
const logger = require('./utils/logger');
const errorLogger = require('./utils/errorLogger');
const commandHandler = require('./handlers/commandHandler');
const eventHandler = require('./handlers/eventHandler');
const AdvancedLogger = require('./utils/advancedLogger');
const InteractionHandler = require('./handlers/interactionHandler');
const AutoPartnershipService = require('./services/autoPartnership');

// Gestione errori processo globale
process.on('unhandledRejection', (reason, promise) => {
  errorLogger.logError('CRITICAL', 'Unhandled Rejection at:', 'UNHANDLED_REJECTION', reason);
});

process.on('uncaughtException', (err) => {
  errorLogger.logError('CRITICAL', 'Uncaught Exception:', 'UNCAUGHT_EXCEPTION', err);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildPresences
  ]
});

// Make client available globally for website
global.discordClient = client;

client.commands = new Collection();

// Gestione errori client Discord
client.on('error', (error) => {
  errorLogger.logError('ERROR', 'Discord Client Error', 'DISCORD_CLIENT_ERROR', error);
});

const init = async () => {
  try {
    // 1. Connessione MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.success('Connesso a MongoDB con successo!');

    // 2. Inizializzazione Sistemi Core
    // Inizializza AdvancedLogger e InteractionHandler
    const advancedLogger = new AdvancedLogger(client, process.env.LOG_CHANNEL_ID);
    const interactionHandler = new InteractionHandler(client, advancedLogger);
    const autoPartnership = new AutoPartnershipService(client);

    // Registra gli handlers nel client per accesso globale
    client.advancedLogger = advancedLogger;
    client.interactionHandler = interactionHandler;
    client.autoPartnership = autoPartnership;

    // 3. Caricamento Handlers
    await commandHandler(client);
    await eventHandler(client);

    // 4. Login Discord
    await client.login(process.env.DISCORD_TOKEN);

    // 5. Avvio Servizi Automatici (dopo login)
    client.once('clientReady', () => {
      autoPartnership.start();
    });

  } catch (err) {
    console.error(err); // FORCE PRINT ERROR
    errorLogger.logError('CRITICAL', `Errore fatale durante l'avvio: ${err.message}`, 'STARTUP_ERROR');
    process.exit(1); // Termina se l'avvio fallisce
  }
};

init();

module.exports = client;
