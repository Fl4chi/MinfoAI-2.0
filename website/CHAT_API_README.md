# MinfoAI Website Chat API - Quick Start

## 🚀 Avvio Rapido

Il chatbot usa la **stessa API key** del bot Discord (già nel `.env`).

### 1. Installa Dipendenze
```bash
npm install express cors @google/generative-ai
```

### 2. Avvia Backend API
```bash
node website/chat-api.js
```

Vedrai:
```
✅ MinfoAI Chat API running on http://localhost:3001
📡 Using GEMINI_API_KEY from .env
```

### 3. Apri Website
Apri `website/index.html` nel browser. Il chatbot ora funziona! 🎉

## 📝 Note

- **Porta**: Default 3001 (cambia con `CHAT_API_PORT` in `.env`)
- **API Key**: Usa automaticamente `GEMINI_API_KEY` dal `.env` esistente
- **CORS**: Abilitato per localhost
- **Logs**: Vedi richieste in console backend

## 🔧 Troubleshooting

**Errore "Failed to fetch"**:
- Verifica che `chat-api.js` sia in esecuzione
- Controlla porta 3001 libera

**Errore API**:
- Verifica `GEMINI_API_KEY` in `.env`
- Controlla quota API Gemini

## 🎯 Produzione

Per deploy in produzione:
1. Usa variabile ambiente `CHAT_API_PORT`
2. Configura CORS per il tuo dominio
3. Aggiungi rate limiting
4. Usa HTTPS
