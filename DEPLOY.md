# 🚀 Guida Deployment VPS - MinfoAI

## 📋 VPS Consigliate (Qualità/Prezzo)

### ⭐ Opzione 1: Contabo VPS S (CONSIGLIATA)
- **Prezzo**: €4.50/mese
- **Specs**: 4 vCPU, 8GB RAM, 100GB SSD, 32TB Traffic
- **Datacenter**: Germania, UK, USA
- **Link**: [contabo.com](https://contabo.com)
- **Perché**: Miglior rapporto qualità/prezzo, risorse abbondanti

### 🟢 Opzione 2: Hetzner Cloud CX11
- **Prezzo**: €3.79/mese
- **Specs**: 1 vCPU, 2GB RAM, 20GB SSD
- **Datacenter**: Germania, Finlandia
- **Link**: [hetzner.com](https://www.hetzner.com/cloud)
- **Perché**: Affidabilità tedesca, ottima rete

### 🆓 Opzione 3: Oracle Cloud (GRATIS)
- **Prezzo**: GRATIS per sempre
- **Specs**: 1 vCPU ARM, 1GB RAM, 50GB Storage
- **Link**: [oracle.com/cloud/free](https://www.oracle.com/cloud/free/)
- **Perché**: Free tier permanente, perfetto per testing

---

## 🛠️ Setup Automatico (Ubuntu 20.04/22.04)

### 1. Connettiti alla VPS via SSH
```bash
ssh root@YOUR_VPS_IP
```

### 2. Scarica e Esegui lo Script di Setup
```bash
curl -o setup.sh https://raw.githubusercontent.com/Fl4chi/MinfoAI-2.0/main/setup.sh
chmod +x setup.sh
./setup.sh
```

---

## 📝 Setup Manuale (Passo per Passo)

### 1. Aggiorna il Sistema
```bash
apt update && apt upgrade -y
```

### 2. Installa Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v  # Verifica installazione
```

### 3. Installa MongoDB
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod
```

### 4. Installa PM2 (Process Manager)
```bash
npm install -g pm2
```

### 5. Clona il Progetto
```bash
cd /opt
git clone https://github.com/Fl4chi/MinfoAI-2.0.git
cd MinfoAI-2.0
```

### 6. Installa Dipendenze
```bash
npm install
```

### 7. Configura `.env`
```bash
nano .env
```

Incolla:
```env
DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE
DISCORD_CLIENT_ID=1421143958649704578
DISCORD_CLIENT_SECRET=fTNXLk71EJ7vH9zS_dn2doZ5SovW3qlq
MONGODB_URI=mongodb://localhost:27017/minfoai
LOG_CHANNEL_ID=YOUR_LOG_CHANNEL_ID
GUILD_ID=1425491403462541324
GEMINI_API_KEY=AIzaSyC0aIEOUCccL_bZAqBWwq7b_oFeZs9yBKA
CHAT_API_PORT=3001
```

Salva con `CTRL+X`, poi `Y`, poi `ENTER`.

### 8. Avvia il Bot con PM2
```bash
pm2 start src/index.js --name minfoai-bot
pm2 start website/server.js --name minfoai-web
pm2 save
pm2 startup
```

### 9. Configura Nginx (Opzionale - per dominio)
```bash
apt install -y nginx
nano /etc/nginx/sites-available/minfoai
```

Incolla:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Attiva:
```bash
ln -s /etc/nginx/sites-available/minfoai /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 10. Configura SSL con Certbot (Opzionale)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

---

## 🔄 Comandi Utili PM2

```bash
pm2 list                    # Lista processi
pm2 logs minfoai-bot        # Vedi logs del bot
pm2 logs minfoai-web        # Vedi logs del web server
pm2 restart minfoai-bot     # Riavvia bot
pm2 stop minfoai-bot        # Ferma bot
pm2 delete minfoai-bot      # Elimina processo
pm2 monit                   # Monitor real-time
```

---

## 🔐 Sicurezza VPS

### 1. Cambia Porta SSH
```bash
nano /etc/ssh/sshd_config
# Cambia Port 22 in Port 2222
systemctl restart sshd
```

### 2. Installa Firewall
```bash
ufw allow 2222/tcp  # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

### 3. Disabilita Root Login
```bash
adduser minfoai
usermod -aG sudo minfoai
nano /etc/ssh/sshd_config
# Imposta PermitRootLogin no
systemctl restart sshd
```

---

## 📊 Monitoraggio

### Installa Netdata (Dashboard Monitoring)
```bash
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

Accedi su `http://YOUR_VPS_IP:19999`

---

## 🆘 Troubleshooting

### Bot non si avvia
```bash
pm2 logs minfoai-bot --lines 50
```

### MongoDB non funziona
```bash
systemctl status mongod
journalctl -u mongod -n 50
```

### Porta 3001 occupata
```bash
lsof -i :3001
kill -9 PID_NUMBER
```

---

## 📞 Supporto

- **Discord**: [Server di Supporto](https://discord.gg/rhE8CsF8Fs)
- **GitHub**: [Issues](https://github.com/Fl4chi/MinfoAI-2.0/issues)

---

**Fatto con ❤️ by Fl4chi**
