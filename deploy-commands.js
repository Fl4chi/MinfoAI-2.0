/**
 * Deploy Commands Script for MinfoAI-2.0
 * 
 * OAUTH2 REQUIRED PERMISSIONS FOR BOT:
 * ========================================
 * ✅ Guilds - Read and manage server info
 * ✅ Identify - Access username, avatar, and banner
 * ✅ Guilds.Members.Read - Read member information (nickname, avatar, roles, etc.)
 * ✅ Bot - Required for bot functionality
 * 
 * REQUIRED BOT PERMISSIONS (in Discord Server):
 * =============================================
 * • Send Messages
 * • Embed Links
 * • Use Slash Commands
 * • Manage Messages
 * • Read Message History
 * • Create Reminders (for partnership reminders)
 * • Mention @everyone/@here/All Roles
 */

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'src/commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  if (!fs.statSync(folderPath).isDirectory()) continue;

  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
      console.log('\x1b[32m✅ Loaded command:\x1b[0m', command.data.name);
    } else {
      console.log('\x1b[33m⚠️  Warning: ${file} missing data or execute\x1b[0m');
    }
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('\x1b[36m🔄 Starting command deployment...\x1b[0m');

    // Deploy guild commands (faster for testing)
    if (process.env.GUILD_ID) {
      const data = await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log(`\x1b[32m✅ Successfully deployed ${data.length} guild commands\x1b[0m`);
    }

    // Deploy global commands (takes 1-2 hours to propagate)
    if (process.env.DEPLOY_GLOBAL === 'true') {
      const globalData = await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
      );
      console.log(`\x1b[32m✅ Successfully deployed ${globalData.length} global commands\x1b[0m`);
    }
  } catch (error) {
    console.error('\x1b[31m❌ Error deploying commands:\x1b[0m', error);
    process.exit(1);
  }
})();
