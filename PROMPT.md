# 🤖 MinfoAI 2.0 - System Prompt & Bot Features Documentation

## 📋 Overview
**MinfoAI 2.0** is a modern Discord bot designed to manage server partnerships with advanced AI integration, MongoDB persistence, and a complete permission system. The bot provides slash commands for partnership requests, approvals, rejections, statistics tracking, and comprehensive logging.

## 🎯 Core Features & Systems

### 1. **Partnership Request System** (`/partnership-request`)
**Purpose**: Allow users to submit partnership requests for their servers
**Parameters**:
- `server-name` (String): Name of the requesting server
- `invite-link` (String): Permanent Discord invite link
- `description` (String): 10-500 character server description

**Process**:
1. Permission check (Admin or Partnership Role)
2. Validate guild configuration (via /setup)
3. Validate invite link format
4. Check for duplicate partnerships
5. Create partnership record in MongoDB
6. Notify staff with action buttons
7. Log to Discord and console

**Output**: Success embed with Partnership ID, status, and AI analysis

---

### 2. **Approval System** (`/partnership-approve`)
**Purpose**: Approve pending partnership requests
**Process**:
1. Permission check (Admin or Partnership Role)
2. Find partnership by ID
3. Validate partnership is pending
4. Update status to "approved"
5. Send confirmation to both parties
6. Log action

---

### 3. **Rejection System** (`/partnership-reject`)
**Purpose**: Reject partnership requests with reason
**Parameters**:
- `partnership-id` (String): ID of partnership to reject
- `reason` (String): Optional rejection reason

**Process**:
1. Permission check
2. Find partnership
3. Update status to "rejected"
4. Store rejection reason
5. Archive record
6. Notify requesting user

---

### 4. **Configuration System** (`/setup`)
**Purpose**: Interactive wizard to configure server-specific settings
**Configures**:
- Guild name
- Partnership channel (where notifications are sent)
- Logs channel (where all actions are logged)
- Partnership role (staff role for approval/rejection)
- Embed colors (customizable)

**Storage**: MongoDB `guildConfig` collection
**Note**: ADMIN_ROLE_ID is NOT needed - administrator Discord permission is sufficient

---

### 5. **Partnership List** (`/partnership-list`)
**Purpose**: View partnerships with filters
**Filters**:
- `status` filter: all, pending, approved, rejected

**Display**: Paginated embed list

---

### 6. **Partnership View** (`/partnership-view`)
**Purpose**: See detailed information about a specific partnership
**Displays**:
- Server name and invite link
- Description
- Request date and time
- Current status
- Staff review notes (if applicable)
- Rejection reason (if rejected)

---

### 7. **Statistics System** (`/partnership-stats`)
**Purpose**: View comprehensive analytics
**Metrics**:
- Total partnerships (all time)
- Success rate (approved/total)
- Pending partnerships
- Average response time
- Monthly trends
- Top performing partnerships

---

### 8. **Report Generation** (`/partnership-report`)
**Purpose**: Generate detailed partnership reports
**Parameters**:
- `period` (String): daily, weekly, monthly, yearly

**Output**: Comprehensive embed with statistics, graphs (if supported), and trends

---

### 9. **Delete Partnership** (`/partnership-delete`)
**Purpose**: Remove a partnership from the system
**Parameters**:
- `partnership-id` (String): ID to delete
- `reason` (String): Optional deletion reason

**Process**:
1. Permission check (Admin/Partnership Role)
2. Find partnership
3. Archive or delete record
4. Log deletion

---

## 🔐 Permission System

**Hierarchy** (highest to lowest):
1. **ADMINISTRATOR** Discord Permission - Grants all access automatically
2. **PARTNERSHIP_ROLE_ID** - Staff role configured via `/setup`

**Note**: ADMIN_ROLE_ID environment variable is **NOT USED** in this version. Instead:
- Check for Discord Administrator permission first
- Fall back to PARTNERSHIP_ROLE_ID from MongoDB config
- This is more flexible and aligns with Discord's permission model

**Commands Protected by Permission Check**:
- `/partnership-approve`
- `/partnership-reject`
- `/partnership-delete`
- `/partnership-stats`
- `/partnership-report`
- `/setup`

---

## 📦 Database Schema

### guildConfig Collection
```javascript
{
  guildId: String,        // Server ID
  guildName: String,      // Custom server name
  partnershipChannelId: String,
  logChannelId: String,
  partnershipRoleId: String,  // Role for staff access
  embedColor: Number,     // Hex color (e.g., 5865F2)
  successColor: Number,   // Green success color
  errorColor: Number,     // Red error color
  setupComplete: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Partnership Collection
```javascript
{
  partnershipId: String,  // Unique ID
  serverName: String,
  serverId: String,
  description: String,
  inviteLink: String,
  requestedBy: String,    // User ID
  requestedAt: Date,
  status: 'pending' | 'approved' | 'rejected',
  reviewedBy: String,     // Staff member ID
  reviewedAt: Date,
  rejectionReason: String,
  memberCount: Number,
  tags: [String],
  notes: String,          // Staff internal notes
  timestamps: {
    createdAt: Date,
    updatedAt: Date
  }
}
```

---

## 🚀 Logging System (FASE 5)

### Console Logging
- **[INFO]**: General information
- **[SUCCESS]**: Successful operations (green)
- **[WARN]**: Warnings or validation issues (yellow)
- **[ERROR]**: Errors or failures (red)
- **[DEBUG]**: Debug info (only if DEBUG=true)

### Discord Channel Logging
All actions are logged to the configured `logChannelId`:
- Partnership requests received
- Approvals granted
- Rejections issued
- Deletions performed
- Configuration changes
- Errors and exceptions

**Format**: Colored embeds with timestamps and user mentions

---

## 🎨 Button Interactions (FASE 5)

Partnership requests include interactive buttons:
- **✅ Approve** - Quick approval button
- **❌ Reject** - Quick rejection button with reason modal
- **📋 View Details** - Shows full partnership info
- **🗑️ Delete** - Admin only deletion button

---

## 📝 Environment Variables

**Required** (.env file):
```
# Bot Configuration
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here

# Database
MONGODB_URI=mongodb://localhost:27017/minfoai

# Partnership Settings
PARTNERSHIP_CHANNEL_ID=your_channel_id_here
LOG_CHANNEL_ID=your_log_channel_id_here
PARTNERSHIP_ROLE_ID=your_partnership_role_id_here

# Optional
NODE_ENV=production
DEBUG=false
```

**Important Notes**:
- ✅ PARTNERSHIP_ROLE_ID replaces STAFF_ROLE_ID
- ❌ ADMIN_ROLE_ID is removed (use Discord Administrator permission instead)
- ✅ LOG_CHANNEL_ID is required for logging

---

## 🔄 Workflow Example

**Scenario**: Server "GameZone" requests partnership

1. User runs `/partnership-request server:GameZone invite:discord.gg/xyz description:Fun gaming server`
2. Bot validates permissions, invites link, guild config
3. Creates partnership record in MongoDB
4. Sends embed to partnership channel with buttons
5. Staff member clicks "✅ Approve"
6. Bot updates status to "approved"
7. Notifications sent to both parties
8. Log entries created in Discord and console

---

## 🛠️ Error Handling

**Common Errors**:
1. **"Server not configured"** → User must run `/setup`
2. **"Permission denied"** → User must be Admin or have Partnership Role
3. **"Partnership not found"** → Invalid partnership ID
4. **"Guild configuration missing"** → Run `/setup` again

**User-Facing Errors**: All errors show in embeds with helpful action suggestions

---

## 📊 Performance Targets

- Command response time: < 1 second
- Database queries: < 500ms
- Concurrent users: 100+
- Uptime: 99.9%

---

## 🔒 Security Features

- ✅ Permission verification on every command
- ✅ Input validation (invite links, text length)
- ✅ Rate limiting protection
- ✅ Audit logging (all actions tracked)
- ✅ Error handling (no sensitive data exposed)
- ✅ MongoDB connection pooling
- ✅ Discord bot token protection (.env)

---

## 📚 File Structure

```
src/
├── index.js                    # Main bot entry point
├── commands/
│   └── partnership/
│       ├── request.js          # Partnership request
│       ├── approve.js          # Approval command
│       ├── reject.js           # Rejection command
│       ├── list.js             # List partnerships
│       ├── view.js             # View partnership details
│       ├── stats.js            # Statistics
│       ├── report.js           # Report generation
│       ├── delete.js           # Delete partnership
│       └── setup.js            # Configuration wizard
├── events/
│   ├── ready.js                # Bot startup
│   └── interactionCreate.js    # Button/command handling
├── handlers/
│   ├── commandHandler.js       # Command loader
│   ├── eventHandler.js         # Event loader
│   └── permissionCheck.js      # Permission middleware
├── database/
│   ├── partnershipSchema.js    # Partnership model
│   └── guildConfigSchema.js    # Guild config model
└── utils/
    ├── logger.js               # Logging system
    └── embedBuilder.js         # Embed creator
```

---

## ✅ Testing Checklist

- [ ] Bot starts without errors
- [ ] `/setup` command configures server
- [ ] `/partnership-request` creates records
- [ ] `/partnership-approve` updates status
- [ ] `/partnership-reject` rejects with reason
- [ ] `/partnership-list` shows partnerships
- [ ] `/partnership-stats` displays metrics
- [ ] Logging works on console and Discord
- [ ] Permission checks work correctly
- [ ] Error messages display properly
- [ ] Button interactions function
- [ ] MongoDB persistence works

---

**Version**: 2.0 (Current)
**Last Updated**: November 19, 2025
**Status**: ✅ Production Ready
