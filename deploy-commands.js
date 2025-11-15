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
      console.log(`✅ Loaded command: ${command.data.name}`);
    } else {
      console.log(`⚠️  Warning: ${file} missing data or execute`);
    }
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`🔄 Registering ${commands.length} slash commands...`);

    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log(`✅ Successfully registered ${data.length} slash commands!`);
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
})();
