# MinfoAI Website - AI Assistant Configuration

## 🔧 Setup API Key

L'assistente AI usa la stessa API key di Gemini del bot Discord.

### Opzione 1: Backend Sicuro (Consigliato)
Crea un endpoint backend che gestisce le chiamate API:

```javascript
// backend/api/chat.js (esempio Node.js/Express)
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/chat', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(req.body.message);
        res.json({ response: result.response.text() });
    } catch (error) {
        res.status(500).json({ error: 'AI Error' });
    }
});

module.exports = router;
```

Poi aggiorna `ai-chat.js`:
```javascript
async callGeminiAPI(message) {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });
    const data = await response.json();
    return data.response;
}
```

### Opzione 2: API Key Diretta (Solo per Testing)
⚠️ **NON usare in produzione** - espone la tua API key!

In `ai-chat.js` linea 92, sostituisci:
```javascript
this.apiKey = 'YOUR_GEMINI_API_KEY'; // Inserisci la tua key qui
```

## 📊 Sistema di Logging

Apri la console del browser (F12) per vedere:
- ✅ Tutti gli errori e warning
- 📈 Performance metrics
- 🤖 AI chat logs

Comandi console disponibili:
```javascript
MinfoAI.getErrorReport()  // Vedi report errori
MinfoAI.aiChat            // Accedi al chatbot
MinfoAI.version           // Versione corrente
```

## 🎨 Personalizzazione Chat

Modifica `chat-styles.css` per cambiare:
- Colori del widget
- Dimensioni e posizione
- Animazioni

## 🚀 Deploy

1. Carica tutti i file su hosting (Netlify/Vercel/GitHub Pages)
2. Configura backend per API key (se usi Opzione 1)
3. Testa il chatbot
4. Monitora console per errori

## ✅ Checklist

- [ ] API key configurata
- [ ] Backend endpoint creato (se Opzione 1)
- [ ] Chatbot testato
- [ ] Console senza errori
- [ ] Logo visibile nella navbar
- [ ] Tutte le sezioni funzionanti
