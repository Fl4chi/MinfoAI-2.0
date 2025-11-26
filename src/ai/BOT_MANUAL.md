# Manuale Completo MinfoAI 2.0

## 🤖 Introduzione
MinfoAI 2.0 è un bot Discord avanzato progettato per gestire community, partnership ed economia con il supporto dell'Intelligenza Artificiale.

## 🏆 Sistema di Tier
Il sistema di progressione si basa su 4 livelli (Tier). Ogni livello sblocca vantaggi esclusivi.

### 🥉 Bronze Tier (Gratuito)
- **Requisiti:** Accessibile a tutti.
- **Vantaggi:**
  - Accesso ai comandi base.
  - Partnership manuali (richiedono approvazione staff).
  - Guadagno base di Coins.

### 🥈 Silver Tier (1000 Coins)
- **Requisiti:** Acquistabile nello `/shop`.
- **Vantaggi:**
  - **Auto-Reply AI:** Il bot risponde automaticamente alle domande base nel canale partnership.
  - **Boost XP:** +10% di esperienza guadagnata.
  - Ruolo Discord dedicato: @Silver Partner.

### 🥇 Gold Tier (2500 Coins)
- **Requisiti:** Acquistabile nello `/shop`.
- **Vantaggi:**
  - **Partnership Prioritarie:** Le richieste appaiono in cima alla lista.
  - **Canali Dedicati:** Accesso a canali esclusivi per partner Gold.
  - **Boost XP:** +25% di esperienza.
  - Ruolo Discord dedicato: @Gold Partner.

### 💎 Platinum Tier (5000 Coins)
- **Requisiti:** Acquistabile nello `/shop`.
- **Vantaggi:**
  - **AI Personalizzata:** Risposte del bot personalizzabili.
  - **Supporto 24/7:** Canale diretto con lo staff.
  - **Boost XP:** +50% di esperienza.
  - **Partnership in Evidenza:** Menzioni speciali nelle partnership.
  - Ruolo Discord dedicato: @Platinum Partner.

---

## 💰 Economia e Shop
La valuta del server sono i **MinfoCoins**.

### 💎 Come Guadagnare Coins

#### Guadagni Base
- **Daily Login Bonus:** +10 coins (ogni giorno)
- **Partnership Request Inviata:** +20 coins (per richiesta)
- **Messaggio Attivo:** +1 coin (ogni 100 messaggi)

#### Guadagni Partnership
- **Partnership Completata:** +100 coins
- **Review Positiva Ricevuta:** +50 coins
- **Partnership Gold Tier:** +500 coins (bonus una tantum)
- **Partnership Platinum Tier:** +1000 coins (bonus una tantum)

#### Guadagni Social
- **Referral Nuovo Utente:** +50 coins (per invito)
- **Partecipazione Eventi:** +150 coins (per evento)
- **Streak 7 Giorni Attività:** +75 coins (settimanale)

#### Guadagni Milestone
- **Milestone Raggiunta:** +200 coins (varia per tipo)
- **Achievement Sbloccato:** +100-500 coins (per achievement)

### 📋 Daily Quests System

Completa le quest giornaliere per guadagnare coins extra! Le quest si resettano ogni 24h.

| Quest | Reward | Difficoltà |
|-------|--------|------------|
| Invia 1 partnership request | +20 coins | ⭐ Facile |
| Approva 3 partnership (staff) | +50 coins | ⭐⭐ Media |
| Invita 1 persona con referral | +30 coins | ⭐ Facile |
| Raggiungi 100 messaggi | +40 coins | ⭐⭐ Media |
| Partnership attiva 30 giorni | +200 coins | ⭐⭐⭐ Difficile |

**Streak Bonus:** Completa tutte le quest per 7 giorni consecutivi → +300 coins bonus!

### 🛍️ Premium Shop

#### 🎁 Visibilità & Promozione
- **Super Boost** (1000 coins) - Partnership in evidenza per 14 giorni
- **Featured Badge** (750 coins) - Badge "⭐ Featured" permanente sul profilo
- **Top Placement** (1500 coins) - Prima posizione in `/partner list` per 7 giorni
- **Highlight Color** (500 coins) - Colore personalizzato per embed partnership

#### ⚡ Booster Temporanei
- **2x Visibility** (200 coins/giorno) - Doppia visibilità per 24h
- **Weekend Boost** (500 coins) - Boost durante tutto il weekend
- **Flash Promotion** (300 coins) - Promozione massiva per 4 ore
- **Holiday Special** (800 coins) - Boost durante festività

#### 🎮 Gamification
- **Achievement Badges** (100-500 coins) - Badge per milestone raggiunte
- **Leaderboard Boost** (400 coins) - +10 posizioni in classifica per 7 giorni
- **Streak Protector** (300 coins) - Proteggi la tua streak partnership (1 uso)
- **XP Multiplier** (500 coins/settimana) - 2x XP guadagnato per 7 giorni

### Comandi Economia:
- `/wallet`: Visualizza il saldo attuale e statistiche guadagni.
- `/shop`: Apre il negozio per acquistare Tier, Boost e Perks.
- `/pay [utente] [importo]`: Invia coins a un altro utente.
- `/daily`: Riscuoti il bonus giornaliero e visualizza le quest.
- `/quests`: Visualizza le quest attive e i progressi.

---

## 🤝 Sistema Partnership
Il cuore di MinfoAI.

### Comandi:
- `/partner request`: Avvia la procedura guidata per richiedere una partnership. L'AI analizzerà la richiesta.
- `/partner list`: Mostra i server partner attuali.
- `/partner info [server]`: Dettagli su un partner specifico.

### Flusso di approvazione:
1.  Utente usa `/partner request`.
2.  Compila il modulo (descrizione, invito, ecc.).
3.  L'AI assegna un **Trust Score** preliminare (0-100).
4.  Lo staff riceve la richiesta nel canale log.
5.  Lo staff approva/rifiuta.
6.  Se approvato, il messaggio di partnership viene pubblicato automaticamente.

---

## 📊 Statistiche e Analytics
- `/stats`: Mostra statistiche dettagliate del server (membri, crescita, partnership attive).
- `/leaderboard`: Classifica dei server/utenti più attivi.

---

## 🛠️ Configurazione (Admin)
- `/setup`: Configura i canali fondamentali (Log, Partnership, Ruoli).
- `/admin add-coins [utente] [importo]`: Aggiunge coins manualmente.
- `/admin set-tier [utente] [tier]`: Assegna un tier manualmente.

---

## ❓ Risoluzione Problemi (Troubleshooting)
- **Il bot non risponde:** Controlla i permessi del bot e che sia online.
- **Errore AI:** Se l'AI non risponde, verifica che la chiave API sia valida. Il bot userà risposte predefinite di fallback.
- **Partnership non pubblicata:** Verifica che il canale partnership sia configurato con `/setup`.
