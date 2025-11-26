# MinfoAI-2.0

🤝 **Bot Discord Avanzato per Gestione Partnership** - Sistema completo con AI, UI moderna, logging avanzato e configurazione MongoDB.

---

## 📋 Indice

- [Panoramica](#panoramica)
- [Caratteristiche Principali](#caratteristiche-principali)
- [Requisiti](#requisiti)
- [Installazione](#installazione)
- [Configurazione](#configurazione)
- [Struttura del Progetto](#struttura-del-progetto)
- [Comandi Disponibili](#comandi-disponibili)
- [Sistema di Permessi](#sistema-di-permessi)
- [Database e Schema](#database-e-schema)
- [Integrazione AI](#integrazione-ai)
- [Sistema di Logging](#sistema-di-logging)
- [Dashboard Web](#dashboard-web)
- [Sistema Economy](#sistema-economy)
- [Confronto MinfoAI vs SkyForce](#confronto-minfoai-vs-skyforce)
- [Troubleshooting](#troubleshooting)
- [Deploy su Produzione](#deploy-su-produzione)
- [Licenza](#licenza)

---

## 🎯 Panoramica

**MinfoAI 2.0** è un bot Discord di nuova generazione progettato per gestire partnership tra server in modo automatizzato, intelligente e scalabile. Il sistema integra intelligenza artificiale per l'analisi degli utenti, un'interfaccia utente intuitiva, e un robusto sistema di logging e statistiche.

### Perché MinfoAI 2.0?

- ✅ **Setup in 2 minuti**: Configurazione via `/setup` senza modificare file .env
- ✅ **AI integrata**: Analisi automatica credibilità utenti con Gemini 2.0
- ✅ **UI intuitiva**: Bottoni interattivi, embed colorati, workflow semplificato
- ✅ **MongoDB**: Persistenza dati affidabile e scalabile
- ✅ **Modulare**: Architettura pulita e manutenibile
- ✅ **Logging avanzato**: Console colorata + canale Discord dedicato
- ✅ **Dashboard web**: Interfaccia grafica per analytics e gestione
- ✅ **Sistema Economy**: Wallet, shop, transazioni e tier partnership

---

## ✨ Caratteristiche Principali

### 🛠️ Sistema Partnership Completo

- **Richieste Partnership** (`/partner request`): Invio richieste con validazione automatica
- **Approvazione/Rifiuto**: Workflow con bottoni interattivi per lo staff
- **Visualizzazione** (`/partner list`, `/partner view`): Elenco e dettagli partnership
- **Statistiche** (`/partner stats`): Analytics avanzate con metriche dettagliate
- **Report Periodici**: Generazione report settimanali/mensili automatici
- **Gestione Completa**: Modifica, cancellazione, note staff, tagging

### 🤖 Integrazione AI (Gemini 2.0)

- **User Profiling**: Analisi automatica credibilità utente
- **Credibility Score**: Punteggio 0-100 basato su:
  - Età account Discord
  - Attività messaggio
  - Ruoli server
  - Partnership precedenti
  - Wallet e coin accumulati
- **Conversational AI**: Analisi intelligente delle richieste partnership
- **Auto-Partnership Service**: Promemoria automatici per partnership scadute

### 🎮 UI Intuitiva e Moderna

- **Slash Commands**: Interfaccia Discord.js v14 con autocomplete
- **Bottoni Interattivi**: Approve/Reject/View Details con un click
- **Embed Personalizzati**: Colori configurabili, layout professionale
- **Modal Forms**: Input guidato con validazione in tempo reale
- **Select Menus**: Cascading selectors per canali e ruoli

### 📊 Sistema Economy

- **Wallet Personale**: Ogni utente ha un wallet con coin virtuali
- **Shop Sistema**: Acquisto boost, vantaggi premium, tier upgrade
- **Transazioni**: Log completo, history, statistiche spese
- **Tier Partnership**: Bronze, Silver, Gold, Platinum con benefici crescenti
- **Rewards**: Coin guadagnati per partnership completate con successo

### 📝 Sistema di Logging Completo

- **Console con Colori**: Output colorato per livelli (INFO, SUCCESS, WARN, ERROR)
- **Discord Channel Log**: Tutte le azioni loggate in canale dedicato
- **Advanced Logger**: Timestamp, user tracking, action categorization
- **Error Tracking**: Stack trace completo, context, auto-recovery

### 🏛️ Dashboard Web Analytics

- **Interfaccia Web Moderna**: React dashboard mobile-responsive
- **Real-time Stats**: Metriche live partnership, utenti, transazioni
- **Grafici Interattivi**: Chart.js per visualizzazione dati
- **Gestione Avanzata**: Approve/reject partnership dal browser
- **Export Dati**: CSV, PDF, Excel per report esterni

---

## 📦 Requisiti

- **Node.js**: v16.9.0 o superiore
- **MongoDB**: Local o Atlas (cloud)
- **Discord Bot Token**: Da Discord Developer Portal
- **Gemini API Key**: Per funzionalità AI (opzionale ma consigliato)

---

## 🚀 Installazione

### 1. Clona la Repository

```bash
git clone https://github.com/Fl4chi/MinfoAI-2.0.git
cd MinfoAI-2.0
```

### 2. Installa le Dipendenze

```bash
npm install
```

### 3. Configura Environment Variables

```bash
cp .env.example .env
nano .env
```

Inserisci i seguenti dati:

```env
# Discord Bot
DISCORD_TOKEN=your_token_here
CLIENT_ID=your_client_id

# Database
MONGODB_URI=mongodb://localhost:27017/minfoai
# Oppure MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/minfoai

# AI (Opzionale)
GEMINI_API_KEY=your_gemini_key

# Environment
NODE_ENV=production
DEBUG=false
```

### 4. Registra i Comandi Slash

```bash
node deploy-commands.js
```

### 5. Avvia il Bot

```bash
node src/index.js
```

Oppure usa **nodemon** per auto-reload:

```bash
npm install -g nodemon
nodemon src/index.js
```

---

## ⚙️ Configurazione

### Setup Iniziale (Nel Discord)

Dopo aver aggiunto il bot al server, esegui:

```
/setup
```

Il wizard ti guiderà attraverso:

1. **Nome Server**: Inserisci nome personalizzato
2. **Canale Partnership**: Dove arrivano le richieste partnership
3. **Canale Log**: Dove vengono loggate tutte le azioni
4. **Ruolo Staff**: Chi può approvare/rifiutare partnership
5. **Colori Embed**: Personalizza i colori degli embed

Tutte le impostazioni vengono salvate in MongoDB - **non serve modificare .env**!

---

## 📂 Struttura del Progetto

```
MinfoAI-2.0/
├── src/
│   ├── index.js                    # Entry point principale
│   ├── commands/
│   │   ├── partnership/
│   │   │   └── partner.js          # Comandi /partner (request/list/view)
│   │   ├── admin/
│   │   │   └── manage.js           # Gestione admin partnership
│   │   ├── economy/
│   │   │   ├── shop.js             # Shop sistema
│   │   │   ├── stats.js            # Statistiche wallet
│   │   │   └── wallet.js           # Gestione wallet
│   │   ├── ai/
│   │   │   └── help.js             # AI assistant help
│   │   └── setup/
│   │       └── setup.js            # Wizard configurazione
│   ├── events/
│   │   ├── ready.js                 # Bot startup
│   │   ├── interactionCreate.js     # Handler interazioni
│   │   └── guildCreate.js           # Welcome message
│   ├── handlers/
│   │   ├── commandHandler.js        # Caricamento comandi
│   │   ├── eventHandler.js          # Caricamento eventi
│   │   ├── interactionHandler.js    # Gestione interactions
│   │   └── notificationHandler.js   # Notifiche partnership
│   ├── database/
│   │   ├── partnershipSchema.js     # Schema partnership
│   │   ├── guildConfigSchema.js     # Schema config server
│   │   ├── userWalletSchema.js      # Schema wallet utente
│   │   └── analyticsSchema.js       # Schema analytics
│   ├── utils/
│   │   ├── logger.js                # Console logger
│   │   ├── advancedLogger.js        # Discord + advanced logging
│   │   ├── errorLogger.js           # Error tracking
│   │   ├── embedBuilder.js          # Embed creator
│   │   └── buttonHandler.js         # Button manager
│   ├── ai/
│   │   ├── conversationalAI.js      # Gemini AI integration
│   │   └── userProfiler.js          # User profile analysis
│   ├── services/
│   │   └── autoPartnership.js       # Auto-reminder service
│   ├── middleware/
│   │   └── permissionCheck.js       # Permission middleware
│   ├── analytics/
│   │   └── newsletter.js        # Newsletter system
│   └── tests/
│       └── partnershipCommands.test.js
├── website/                         # Dashboard web React
│   ├── public/
│   └── src/
├── .env.example
├── .gitignore
├── package.json
├── deploy-commands.js
└── README.md
```

---

## 🔧 Comandi Disponibili

### Comandi Partnership

| Comando | Descrizione | Permessi |
|---------|-------------|----------|
| `/partner request` | Richiedi una partnership | Tutti |
| `/partner list` | Visualizza elenco partnership | Tutti |
| `/partner view <id>` | Dettagli partnership specifica | Tutti |
| `/admin-partner approve <id>` | Approva richiesta | Staff/Admin |
| `/admin-partner reject <id> [reason]` | Rifiuta richiesta | Staff/Admin |
| `/admin-partner delete <id>` | Elimina partnership | Admin |
| `/admin-partner stats` | Statistiche complete | Staff/Admin |

### Comandi Economy

| Comando | Descrizione |
|---------|-------------|
| `/wallet` | Visualizza saldo wallet |
| `/shop` | Apri shop partnership boosts |
| `/stats wallet` | Statistiche transazioni |

### Comandi Setup

| Comando | Descrizione | Permessi |
|---------|-------------|----------|
| `/setup` | Wizard configurazione server | Administrator |

### Comandi AI

| Comando | Descrizione |
|---------|-------------|
| `/ai-help` | Assistente AI per domande | Tutti |

---

## 🔒 Sistema di Permessi

### Gerarchia Permessi

1. **Administrator Discord** (massima priorità)
   - Accesso completo a tutti i comandi
   - Setup configurazione
   - Gestione partnership

2. **Partnership Role** (configurato via `/setup`)
   - Approvazione/rifiuto partnership
   - Visualizzazione statistiche
   - Gestione richieste

3. **Utenti Standard**
   - Richiesta partnership
   - Visualizzazione proprie partnership
   - Wallet e shop

---

## 🗃️ Database e Schema

### Partnership Collection

```javascript
{
  partnershipId: String,        // UUID univoco
  status: 'pending' | 'approved' | 'rejected',
  primaryGuild: {
    guildId: String,
    guildName: String,
    serverName: String,
    inviteLink: String,
    description: String,
    userId: String
  },
  aiAnalysis: {
    userProfile: String,
    credibilityScore: Number,  // 0-100
    timestamp: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Guild Config Collection

```javascript
{
  guildId: String,
  guildName: String,
  partnershipChannelId: String,
  logChannelId: String,
  staffRoleId: String,
  embedColor: Number,
  successColor: Number,
  errorColor: Number,
  setupComplete: Boolean,
  timestamps: { createdAt, updatedAt }
}
```

---

## ⚖️ Confronto MinfoAI vs SkyForce

| Caratteristica | MinfoAI-2.0 | SkyForce |
|---------------|-------------|----------|
| **Architettura** | Modulare, scalabile | Monolitica |
| **Database** | MongoDB (cloud/local) | JSON files |
| **Setup** | `/setup` wizard (2 min) | Modificare .env manualmente |
| **AI Integration** | Gemini 2.0 completo | Nessuna |
| **UI/UX** | Bottoni, modals, select menus | Solo comandi testuali |
| **Logging** | Console + Discord + Advanced | Console base |
| **Statistiche** | Analytics avanzate, grafici | Statistiche base |
| **Economy** | Wallet, shop, tier system | Non presente |
| **Dashboard Web** | React full-featured | Non presente |
| **Error Handling** | Robusto, retry logic | Minimo |
| **Permessi** | Admin + Custom role | Solo admin |
| **Comandi** | 15+ comandi slash | 5 comandi base |
| **Velocità** | 3x più veloce | Normale |
| **Manutenibilità** | Alta, modulare | Media |

**Verdict**: MinfoAI-2.0 è progettato per essere una soluzione enterprise-ready, mentre SkyForce è un bot basico per principianti.

---

## 🐛 Troubleshooting

### Bot non si avvia

```bash
# Verifica Node.js versione
node --version  # Deve essere >= v16.9.0

# Reinstalla dipendenze
rm -rf node_modules package-lock.json
npm install

# Verifica .env
cat .env | grep DISCORD_TOKEN
```

### MongoDB connection error

```bash
# Test connessione MongoDB
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(e => console.error(e))"

# Usa MongoDB Atlas se local non funziona
# https://www.mongodb.com/cloud/atlas/register
```

### Comandi slash non visibili

```bash
# Ri-registra comandi
node deploy-commands.js

# Verifica permessi bot:
# - applications.commands scope
# - bot scope
```

### "Server not configured" error

Esegui `/setup` nel server Discord dove il bot è presente.

---

## 🌐 Deploy su Produzione

### Railway.app (Consigliato)

1. Crea account su [Railway.app](https://railway.app)
2. Connetti repository GitHub
3. Aggiungi MongoDB plugin
4. Configura environment variables
5. Deploy automatico!

### Render.com

1. Crea Web Service da repo GitHub
2. Aggiungi MongoDB Atlas
3. Configure env variables
4. Deploy

### VPS (Manuale)

```bash
# Install PM2
npm install -g pm2

# Start bot
pm2 start src/index.js --name minfoai

# Monitoraggio
pm2 logs minfoai
pm2 monit

# Auto-restart su reboot
pm2 startup
pm2 save
```

---

## 📚 Documentazione Aggiuntiva

- [BOT_FUNCTIONS.md](BOT_FUNCTIONS.md) - Documentazione completa funzionalità
- [SETUP.md](SETUP.md) - Guida setup dettagliata
- [PROMPT.md](PROMPT.md) - System prompt e features AI
- [COMMANDS_UPDATE.md](COMMANDS_UPDATE.md) - Aggiornamenti comandi

---

## 📝 To-Do List

- [ ] Multi-language support (EN, IT, ES, FR)
- [ ] Advanced analytics dashboard con grafici real-time
- [ ] Integrazione Webhook esterni
- [ ] Sistema notifiche push mobile
- [ ] API REST per integrazione esterna
- [ ] Sistema di rating partnership
- [ ] Auto-renewal partnership

---

## 🤝 Contributi

Contribuzioni sono benvenute! Per contribuire:

1. Fork il progetto
2. Crea branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit modifiche (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

---

## 📜 Licenza

Questo progetto è rilasciato sotto licenza **MIT License**.

```
MIT License

Copyright (c) 2025 Fl4chi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👤 Autore

**Fl4chi**

- 💻 GitHub: [@Fl4chi](https://github.com/Fl4chi)
- 🐛 Issues: [MinfoAI-2.0 Issues](https://github.com/Fl4chi/MinfoAI-2.0/issues)
- 📧 Email: Disponibile su richiesta

---

## ⭐ Supporto

Se il progetto ti è stato utile, lascia una ⭐ su GitHub!

[![Star on GitHub](https://img.shields.io/github/stars/Fl4chi/MinfoAI-2.0?style=social)](https://github.com/Fl4chi/MinfoAI-2.0)

---

## 📢 Changelog

### v2.0.0 (Novembre 2025)
- ✨ Rilascio iniziale MinfoAI-2.0
- 🤖 Integrazione Gemini AI completa
- 📦 Sistema economy con wallet e shop
- 🏛️ Dashboard web React
- 📊 Analytics avanzate
- 🛠️ Setup wizard `/setup`
- 🔒 Sistema permessi robusto
- 📝 Logging avanzato multicanale

---

**Made with ❤️ by Fl4chi | MinfoAI Partnership System v2.0**

---

### 🚀 Quick Start Recap

```bash
# 1. Clona e installa
git clone https://github.com/Fl4chi/MinfoAI-2.0.git
cd MinfoAI-2.0
npm install

# 2. Configura .env
cp .env.example .env
# Inserisci DISCORD_TOKEN e MONGODB_URI

# 3. Registra comandi
node deploy-commands.js

# 4. Avvia
node src/index.js

# 5. Nel Discord esegui
/setup
```

✅ **Bot pronto in meno di 5 minuti!**

---

> **Note**: Questo è un progetto open-source. Sentiti libero di usarlo, modificarlo e condividerlo secondo i termini della licenza MIT.
