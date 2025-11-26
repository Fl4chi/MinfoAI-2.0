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

### Come guadagnare Coins:
1.  **Partnership:** Ogni partnership approvata conferisce un numero di coins basato sul Tier del server partner.
2.  **Attività:** Partecipando attivamente nel server.
3.  **Daily:** Comando giornaliero (se implementato).

### Comandi Economia:
- `/wallet`: Visualizza il saldo attuale.
- `/shop`: Apre il negozio per acquistare Tier o Boost.
- `/pay [utente] [importo]`: Invia coins a un altro utente.

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
