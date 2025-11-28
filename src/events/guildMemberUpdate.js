const LogHandler = require('../handlers/logHandler');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        const logHandler = new LogHandler(newMember.client);
        const changes = [];

        // Check Nickname
        if (oldMember.nickname !== newMember.nickname) {
            changes.push({ name: 'Nickname', value: `${oldMember.nickname || oldMember.user.username} ➔ ${newMember.nickname || newMember.user.username}` });
        }

        // Check Roles
        const oldRoles = oldMember.roles.cache;
        const newRoles = newMember.roles.cache;

        const addedRoles = newRoles.filter(r => !oldRoles.has(r.id));
        const removedRoles = oldRoles.filter(r => !newRoles.has(r.id));

        if (addedRoles.size > 0) {
            changes.push({ name: 'Roles Added', value: addedRoles.map(r => r.name).join(', ') });
        }
        if (removedRoles.size > 0) {
            changes.push({ name: 'Roles Removed', value: removedRoles.map(r => r.name).join(', ') });
        }

        if (changes.length > 0) {
            await logHandler.log('ROLE_UPDATE', newMember.guild, {
                member: newMember,
                changes: changes
            });
        }
    }
};
