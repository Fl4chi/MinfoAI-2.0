const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const logger = require('./utils/logger');
const errorLogger = require('./utils/errorLogger');
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
  useUnifiedTopology: true,
}).then(async () => {
  errorLogger.logInfo('INFO', 'Connesso a MongoDB con successo!', 'DB_CONNECTION_SUCCESS');

  // Carica handlers
  await commandHandler(client);
  await eventHandler(client);

}).catch(err => {
  errorLogger.logError('CRITICAL', 'Errore connessione MongoDB', 'DB_CONNECTION_FAILED', err);
});

// Gestione di errori non catturati
process.on('unhandledRejection', err => {
  errorLogger.logError('CRITICAL', 'Rejection non gestita', 'UNHANDLED_REJECTION', err);
});

process.on('uncaughtException', err => {
  errorLogger.logError('CRITICAL', 'Eccezione non gestita', 'UNCAUGHT_EXCEPTION', err);
});

// Login bot
client.login(process.env.DISCORD_TOKEN).catch(err => {
  errorLogger.logError('CRITICAL', 'Errore login Discord', 'DISCORD_CONNECTION_FAILED', err);
});
