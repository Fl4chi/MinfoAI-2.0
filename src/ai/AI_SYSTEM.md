# 🤖 MinfoAI 2.0 - AI System Documentation

## Panoramica del Sistema

Il sistema AI di MinfoAI-2.0 è un insieme integrato di moduli intelligenti progettati per fornire:
- **Profiling utenti** - Raccogliere e analizzare dati sugli utenti
- **Partnership Matching** - Suggerire server partnership basato su AI
- **Staff Assistance** - Aiutare i gestori del server con insights e analytics

## Architettura

```
└─ src/ai/
   ├─ ai.config.js          # Configurazione centralizzata
   ├─ userProfiler.js       # Sistema di profiling (182 LOC)
   ├─ partnershipMatcher.js # Motore AI matching (214 LOC)
   ├─ staffAssistant.js     # Assistente staff (248 LOC)
   └─ AI_SYSTEM.md          # Questa documentazione
```

## Moduli Principali

### 1️⃣ ai.config.js - Configurazione Centralizzata

Configurazioni globali per l'intero sistema AI:

```javascript
- engine: tipo di motore AI (memoria, ollama, huggingface)
- userProfiler: weights per calcolo compatibilità
- partnershipMatcher: soglie e parametri di matching
- staffAssistant: privilegi e notifiche staff
- privacy: dati esclusti e policy di retention
- errorCodes: codici errore dedicati (8000-8005)
```

**Uso:**
```javascript
const AIConfig = require('./ai.config');
const minThreshold = AIConfig.partnershipMatcher.minCompatibilityThreshold;
```

---

### 2️⃣ userProfiler.js - Profiling Utenti

**Responsabilità:**
- Raccogliere dati non-sensibili sugli utenti
- Tracciare interazioni e preferenze
- Calcolare score di compatibilità

**Dati Raccolti (Privacy-Safe):**
- userId, username, discriminator
- Server membership (guilds)
- Interaction history (ultimi 100 eventi)
- Compatibility scores per server

**Metodi Principali:**
```javascript
await userProfiler.createOrUpdateProfile(user, guildIds)
await userProfiler.logInteraction(userId, type, data)
await userProfiler.updateUserGuilds(userId, guildIds)
const score = userProfiler.calculateCompatibility(userId, server)
await userProfiler.cleanupCache()
```

**Esempio:**
```javascript
const userProfiler = require('./userProfiler');

// Creare profilo per un utente
await userProfiler.createOrUpdateProfile(user, ['12345', '67890']);

// Registrare interazione
await userProfiler.logInteraction(userId, 'PARTNERSHIP_VIEW', {serverId: 'xyz'});

// Calcolare compatibilità
const score = userProfiler.calculateCompatibility(userId, partnerServer);
console.log(`Compatibility: ${score}%`);
```

---

### 3️⃣ partnershipMatcher.js - Motore AI di Matching

**Responsabilità:**
- Registrare server partner
- Generare raccomandazioni personalizzate
- Calcolare score di compatibilità
- Gestire cache raccomandazioni (24 ore)

**Algoritmo di Matching:**
```
CompatibilityScore = 
  (GuildMatch × 0.35) +           # Numero di server dell'utente
  (RoleMatch × 0.25) +             # Ruoli comuni
  (HistoryMatch × 0.20) +          # Attività utente
  (TypologyMatch × 0.20)           # Tipo server
```

**Metodi Principali:**
```javascript
await partnershipMatcher.registerPartnerServer(id, data)
await partnershipMatcher.generateRecommendations(userId)
await partnershipMatcher.getRecommendations(userId)
await partnershipMatcher.removePartnerServer(serverId)
partnershipMatcher.getSystemStats()
```

**Esempio:**
```javascript
const matcher = require('./partnershipMatcher');

// Registrare un server partner
await matcher.registerPartnerServer('guild123', {
  name: 'Gaming Hub',
  memberCount: 500,
  category: 'gaming',
  language: 'it'
});

// Ottenere raccomandazioni per un utente
const recs = await matcher.getRecommendations(userId);
console.log(`3 Recommended servers:`, recs);
// Output: [{serverId, serverName, compatibilityScore, reason}, ...]
```

**Output Raccomandazioni:**
```javascript
{
  serverId: 'guild456',
  serverName: 'Creative Studio',
  compatibilityScore: 82,
  reason: 'Server molto attivo (800 membri) • Match perfetto basato su AI 🔥',
  features: ['creative', 'art', 'design'],
  memberCount: 800,
  language: 'it'
}
```

---

### 4️⃣ staffAssistant.js - Assistente per Staff

**Responsabilità:**
- Gestire richieste partnership in review
- Fornire analytics e insights agli staff
- Generare dashboard riepilogativa
- Inviare reminders su richieste pending

**Dati Visibili allo Staff (Privacy-Respecting):**
- userId, username (no sensibili data)
- guildCount
- compatibilityScore
- recommendedPartners

**Metodi Principali:**
```javascript
const profile = staffAssistant.getStaffUserProfile(userId)
await staffAssistant.addPendingRequest(userId, serverId, data)
await staffAssistant.approvePendingRequest(requestId, notes)
await staffAssistant.rejectPendingRequest(requestId, reason)
await staffAssistant.generateAnalyticsReport()
await staffAssistant.getStaffDashboard()
await staffAssistant.sendPendingRequestsReminder()
```

**Esempio - Dashboard Staff:**
```javascript
const dashboard = await staffAssistant.getStaffDashboard();
/*
{
  overview: {
    totalUsers: 150,
    totalPartnerServers: 12,
    averageCompatibilityScore: 72.5,
    activePendingRequests: 5,
    approvedPartnerships: 23,
    userEngagement: {high: 45, medium: 60, low: 45},
    timestamp: Date
  },
  pendingRequests: [
    {
      id: 'user123-server456-timestamp',
      userId: 'user123',
      username: 'Marco',
      status: 'pending',
      createdAt: Date
    }
  ],
  recentApprovals: [...],
  permissions: {viewUserProfiles: true, ...}
}
*/
```

---

## Privacy & Sicurezza

### Dati Raccolti (NON Sensibili)
✅ userId, username, server membership, interaction counts
✅ Compatibility scores, partnership preferences
✅ Analytics non-identificative

### Dati Esclusi (Sensibili)
❌ Password, token, billing info
❌ Personal emails in content
❌ Messages or DM content
❌ IP addresses

### Policy
- **Encryption:** Storage automaticamente criptato
- **Retention:** Dati cancellati dopo 90 giorni di inattività
- **Anonimizzazione:** Dati auto-anonimizzati nei report
- **Rate Limiting:** Protezione da overload

---

## Configurazione dei Pesi di Matching

```javascript
compatibilityWeights: {
  guildMatch: 0.35,        // 35% - numero server utente
  roleMatch: 0.25,         // 25% - ruoli comuni
  historyMatch: 0.20,      // 20% - frequenza interazioni
  typologyMatch: 0.20      // 20% - tipo di server
}
```

Modifica in `ai.config.js` per regolare algoritmo di matching.

---

## Categorie Partner Supportate

- gaming
- social
- learning
- creative
- business
- community

---

## Error Codes del Sistema AI

| Code | Modulo | Significato |
|------|--------|-------------|
| 8000 | AI Engine | Errore generale del motore AI |
| 8001 | Profiler | Errore nel profiling utente |
| 8002 | Matcher | Errore nell'algoritmo di matching |
| 8003 | Staff | Errore nel sistema staff |
| 8004 | Privacy | Violazione della privacy |
| 8005 | Rate Limit | Limite di rate raggiunto |

---

## Feature Flags

Tutti disabilitati di default in `ai.config.js`:

```javascript
features: {
  userProfiling: true,           // ✅ Abilitato
  partnershipMatching: true,     // ✅ Abilitato
  staffDashboard: true,          // ✅ Abilitato
  predictiveAnalytics: true,     // ✅ Abilitato
  autoRecommendations: true      // ✅ Abilitato
}
```

---

## Prossimi Passi di Implementazione

1. **Creare Slash Commands** per esporre AI al bot
   - `/ai user-profile [user]`
   - `/ai partner-recommendations`
   - `/ai staff-dashboard` (admin only)

2. **Integrare Database** per persistenza dati
   - Collections MongoDB per profili permanenti

3. **Setup Reminders Periodici** (Cron Jobs)
   - Reminder staff ogni 24 ore
   - Cache cleanup settimanale

4. **Testing Completo**
   - Unit tests per ogni modulo
   - Integration tests con Discord API
   - Load testing per performance

---

## Info Sviluppatore

**Autore:** MinfoAI Development Team  
**Creato:** Nov 2025  
**Versione:** 2.0.0  
**Linguaggio:** Node.js + JavaScript (ES6+)  
**Dipendenze:** Discord.js, Mongoose, errorLogger  

**Total Lines of Code:** 784 LOC  
**Moduli:** 4 moduli AI + config  
**Error Codes:** 6 codici dedicati

---

## License

Parte di MinfoAI-2.0 - Bot Discord per gestione partnership
