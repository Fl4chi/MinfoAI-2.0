# Partnership Commands Update

This document outlines the changes needed for partnership commands to integrate with the new MongoDB configuration system and permission middleware.

## Changes Summary

### All Partnership Commands (request.js, approve.js, reject.js, etc.)

#### 1. Add Required Imports
```javascript
const permissionCheck = require('../../middleware/permissionCheck');
const GuildConfig = require('../../schemas/guildConfig');
```

#### 2. Update Execute Function
Add permission verification at the start:
```javascript
async execute(interaction) {
  // Permission check
  const hasPermission = await permissionCheck(interaction);
  if (!hasPermission) return;
  
  // Get guild configuration
  const guildConfig = await GuildConfig.findOne({ guildId: interaction.guildId });
  if (!guildConfig) {
    const errorEmbed = new EmbedBuilder()
      .setColor(0xdc2626)
      .setTitle('❌ Errore di Configurazione')
      .setDescription('Esegui `/setup` per configurare il bot');
    return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }
  
  // Rest of the command logic...
}
```

#### 3. Replace Environment Variables
Change from:
```javascript
const staffRoleId = process.env.STAFF_ROLE_ID;
const partnershipChannelId = process.env.PARTNERSHIP_CHANNEL_ID;
const logChannelId = process.env.LOG_CHANNEL_ID;
```

To:
```javascript
const staffRoleId = guildConfig.staffRoleId;
const partnershipChannelId = guildConfig.partnershipChannelId;
const logChannelId = guildConfig.logChannelId;
```

#### 4. Use Dynamic Colors
Instead of hardcoded colors, use config:
```javascript
const embedColor = guildConfig.embedColor || 0x3b82f6;
const successColor = guildConfig.successColor || 0x22c55e;
const errorColor = guildConfig.errorColor || 0xdc2626;
```

## Specific Command Updates

### request.js
- Add permission check at start of execute
- Replace `process.env.STAFF_ROLE_ID` with `guildConfig.staffRoleId`
- Replace channel notifications to use `guildConfig.partnershipChannelId`

### approve.js
- Add permission check at start of execute
- Load guildConfig and use config values for all channel/role references

### reject.js
- Add permission check at start of execute
- Load guildConfig and use config values for all channel/role references

## MongoDB Config Fields Used

- `guildConfig.staffRoleId` - Staff role for partnership management
- `guildConfig.partnershipChannelId` - Channel for partnership notifications
- `guildConfig.logChannelId` - Channel for command logging
- `guildConfig.embedColor` - Primary embed color
- `guildConfig.successColor` - Success message color
- `guildConfig.errorColor` - Error message color

## Testing Checklist

- [ ] Permission check works (non-admin users are denied)
- [ ] Commands fail gracefully if server not configured
- [ ] All channel notifications use correct channels from config
- [ ] All embed colors use config values
- [ ] All errors are logged with advancedLogger

## Implementation Notes

These updates ensure:
1. Centralized permission management
2. Per-server configuration without environment variables
3. Consistent error handling and logging
4. Clean UI with customizable colors
5. Proper staff role validation

All partnership commands must follow this pattern for consistency and security.
