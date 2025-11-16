const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Commands to delete
const commandsToDelete = ['info', 'setbot', 'permission'];

(async () => {
  try {
    console.log('Deleting old commands...');
    
    // Get all global commands
    const globalCommands = await rest.get(Routes.applicationCommands(process.env.CLIENT_ID));
    
    for (const command of globalCommands) {
      if (commandsToDelete.includes(command.name)) {
        console.log(`Deleting command: ${command.name}`);
        await rest.delete(Routes.applicationCommand(process.env.CLIENT_ID, command.id));
        console.log(`✓ Deleted: ${command.name}`);
      }
    }
    
    console.log('Old commands successfully deleted!');
  } catch (error) {
    console.error('Error deleting commands:', error);
  }
})();
