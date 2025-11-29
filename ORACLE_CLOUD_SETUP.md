# 🆓 Guida Completa: Oracle Cloud Free Tier

## 🌐 Cos'è Oracle Cloud Free Tier?

Oracle offre **GRATIS PER SEMPRE** (non è un trial):
- **2 VM AMD** (1 vCPU, 1GB RAM ciascuna)
- **4 VM ARM** (Ampere A1, fino a 4 vCPU e 24GB RAM TOTALI)
- **200GB Block Storage**
- **10GB Object Storage**

**Perfetto per MinfoAI!** Puoi usare 1 VM ARM con 2 vCPU e 12GB RAM gratis.

---

## 📝 Step 1: Creazione Account Oracle Cloud

### 1. Vai sul sito
🔗 **Link**: https://www.oracle.com/cloud/free/

### 2. Clicca su "Start for Free"
- Inserisci email, nome, paese
- Scegli "Home Region" (consiglio: **Frankfurt** o **Amsterdam** per l'Europa)
- ⚠️ **IMPORTANTE**: La Home Region NON può essere cambiata dopo!

### 3. Verifica Email
- Controlla la tua email e clicca sul link di verifica

### 4. Inserisci Carta di Credito
- Oracle richiede una carta per verificare l'identità
- **NON ti addebiterà nulla** se usi solo il Free Tier
- Puoi usare anche carte prepagate (Revolut, N26, ecc.)

### 5. Completa la Registrazione
- Aspetta 5-10 minuti per l'attivazione dell'account

---

## 🖥️ Step 2: Creazione VM Gratuita

### 1. Accedi alla Console
🔗 https://cloud.oracle.com/

### 2. Vai su "Compute" → "Instances"
- Menu hamburger (☰) in alto a sinistra
- Clicca su **"Compute"** → **"Instances"**

### 3. Clicca "Create Instance"

### 4. Configurazione VM
**Name**: `minfoai-bot`

**Placement**:
- Availability Domain: Lascia default
- Fault Domain: Lascia default

**Image and Shape**:
- Clicca su **"Change Image"**
- Seleziona **"Canonical Ubuntu"** → **"22.04"**
- Clicca **"Select Image"**

- Clicca su **"Change Shape"**
- Seleziona **"Ampere"** (ARM)
- Scegli:
  - **OCPU**: 2
  - **Memory (GB)**: 12
- Clicca **"Select Shape"**

**Networking**:
- Lascia tutto di default
- Assicurati che "Assign a public IPv4 address" sia **CHECKED**

**Add SSH Keys**:
- Seleziona **"Generate a key pair for me"**
- Clicca **"Save Private Key"** e **"Save Public Key"**
- ⚠️ **IMPORTANTE**: Salva questi file! Li userai per connetterti via SSH

**Boot Volume**:
- Lascia default (50GB è incluso nel Free Tier)

### 5. Clicca "Create"
- Aspetta 2-3 minuti che la VM si avvii
- Quando vedi lo stato **"RUNNING"** (pallino verde), sei pronto!

---

## 🔓 Step 3: Configurazione Firewall Oracle

### 1. Nella pagina della VM, clicca sul nome della "Subnet"
(Es: `subnet-20250128-1234`)

### 2. Clicca sulla "Default Security List"

### 3. Clicca "Add Ingress Rules"

Aggiungi queste regole:

**Regola 1: SSH (Porta 22)**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `22`
- Description: `SSH`

**Regola 2: HTTP (Porta 80)**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `80`
- Description: `HTTP`

**Regola 3: HTTPS (Porta 443)**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `443`
- Description: `HTTPS`

**Regola 4: Dashboard (Porta 3001)**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `3001`
- Description: `MinfoAI Dashboard`

---

## 🔌 Step 4: Connessione SSH

### Su Windows (PowerShell)
```powershell
# Vai nella cartella dove hai salvato la chiave privata
cd C:\Users\TuoNome\Downloads

# Connettiti (sostituisci YOUR_VM_IP con l'IP pubblico della VM)
ssh -i ssh-key-XXXX.key ubuntu@YOUR_VM_IP
```

### Su Mac/Linux
```bash
# Dai i permessi corretti alla chiave
chmod 400 ~/Downloads/ssh-key-XXXX.key

# Connettiti
ssh -i ~/Downloads/ssh-key-XXXX.key ubuntu@YOUR_VM_IP
```

⚠️ **Dove trovo l'IP della VM?**
- Nella pagina "Instance Details", cerca **"Public IP Address"**

---

## 🛠️ Step 5: Setup MinfoAI sulla VM

### 1. Una volta connesso via SSH, aggiorna il sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Apri il Firewall Ubuntu (UFW)
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp
sudo ufw enable
```

### 3. Installa Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # Verifica (dovrebbe mostrare v20.x.x)
```

### 4. Installa MongoDB
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ arch=arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 5. Installa PM2
```bash
sudo npm install -g pm2
```

### 6. Clona il Progetto
```bash
cd ~
git clone https://github.com/Fl4chi/MinfoAI-2.0.git
cd MinfoAI-2.0
```

### 7. Installa Dipendenze
```bash
npm install
```

### 8. Crea il file `.env`
```bash
nano .env
```

Incolla (sostituisci i valori se necessario):
```env
DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE
DISCORD_CLIENT_ID=1421143958649704578
DISCORD_CLIENT_SECRET=fTNXLk71EJ7vH9zS_dn2doZ5SovW3qlq
MONGODB_URI=mongodb://localhost:27017/minfoai
LOG_CHANNEL_ID=1425491403462541324
GUILD_ID=1425491403462541324
GEMINI_API_KEY=AIzaSyC0aIEOUCccL_bZAqBWwq7b_oFeZs9yBKA
CHAT_API_PORT=3001
```

Salva con `CTRL+X`, poi `Y`, poi `ENTER`.

### 9. Avvia il Bot
```bash
pm2 start src/index.js --name minfoai-bot
pm2 start website/server.js --name minfoai-web
pm2 save
pm2 startup
```

Copia e incolla il comando che PM2 ti mostra (inizia con `sudo env PATH=...`)

### 10. Verifica che Funzioni
```bash
pm2 logs minfoai-bot --lines 20
```

Dovresti vedere: `✅ MinfoAI is online!`

---

## 🌐 Step 6: Accedi alla Dashboard

Apri il browser e vai su:
```
http://YOUR_VM_IP:3001/dashboard.html
```

Sostituisci `YOUR_VM_IP` con l'IP pubblico della tua VM Oracle.

---

## 🎯 Comandi Utili

```bash
pm2 list                    # Lista processi
pm2 logs minfoai-bot        # Vedi logs del bot
pm2 restart minfoai-bot     # Riavvia bot
pm2 stop minfoai-bot        # Ferma bot
pm2 monit                   # Monitor real-time
```

---

## 🔄 Aggiornare il Bot

```bash
cd ~/MinfoAI-2.0
git pull
npm install
pm2 restart all
```

---

## ⚠️ Problemi Comuni

### "Out of host capacity" durante la creazione VM
Oracle ha limiti di disponibilità per le VM ARM gratuite. Prova:
1. Cambia Availability Domain
2. Riprova in orari diversi (notte europea = meno traffico)
3. Usa uno script automatico per ritentare ogni 5 minuti

### MongoDB non si avvia su ARM
Assicurati di aver usato `arch=arm64` nel comando di installazione.

### Dashboard non raggiungibile
Verifica:
1. Firewall Oracle (Security List)
2. Firewall Ubuntu (`sudo ufw status`)
3. PM2 web server attivo (`pm2 list`)

---

## 💡 Vantaggi Oracle Cloud

✅ **Gratis per sempre** (non scade mai)  
✅ **Prestazioni eccellenti** (ARM Ampere A1)  
✅ **24GB RAM totali** disponibili  
✅ **200GB storage** incluso  
✅ **Nessun limite di traffico**  

---

## 📞 Supporto

- **Discord**: [Server di Supporto](https://discord.gg/rhE8CsF8Fs)
- **GitHub**: [Issues](https://github.com/Fl4chi/MinfoAI-2.0/issues)

---

**Fatto con ❤️ by Fl4chi**
