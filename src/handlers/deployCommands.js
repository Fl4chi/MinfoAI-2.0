const { REST, Routes } = require('discord.js');
const errorLogger = require('../utils/errorLogger');


/**
 * Deploys slash commands to Discord API
 * @param {Client} client - The Discord Client
 */
module.exports = async (client) => {
    try {
        const commands = [];
        client.commands.forEach(cmd => {
            if (cmd.data) {
                commands.push(cmd.data.toJSON());
            }
        });

        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

        errorLogger.logInfo('INFO', `Started refreshing ${commands.length} application (/) commands.`, 'DEPLOY_START');

        // 1. Purge Guild Commands (Remove old development commands)
        const guilds = client.guilds.cache.map(guild => guild.id);
        for (const guildId of guilds) {
            try {
                await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: [] });
                errorLogger.logInfo('INFO', `Purged guild commands for guild: ${guildId}`, 'DEPLOY_PURGE');
            } catch (error) {
                errorLogger.logWarn('WARN', `Failed to purge guild commands for ${guildId}`, 'DEPLOY_PURGE_ERROR');
            }
        }

        // 2. Deploy Global Commands (The new standard)
        const data = await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );

        errorLogger.logInfo('INFO', `Successfully reloaded ${data.length} application (/) commands globally.`, 'DEPLOY_SUCCESS');

    } catch (error) {
        errorLogger.logError('CRITICAL', 'Failed to deploy commands', 'DEPLOY_ERROR', error);
    }
};
