# Quick Start Ollama per MinfoAI 2.0

## 🚀 Installazione Rapida

### 1. Scarica Ollama
Vai su: https://ollama.ai/download
Scarica la versione per Windows e installa.

### 2. Apri PowerShell e esegui:
```powershell
# Scarica il modello LLaMA 2 (circa 4GB, attendi 5-10 min)
ollama pull llama2

# Avvia il server Ollama
ollama serve
```

### 3. Verifica
Apri un NUOVO terminale PowerShell e testa:
```powershell
curl http://localhost:11434/api/tags
```

Se vedi una risposta JSON con i modelli, funziona! ✅

### 4. Riavvia il bot
```powershell
# Nel terminale del bot (Ctrl+C per fermare)
npm start
```

Dovresti vedere:
```
[00:XX:XX] ✓ INFO (✅ Ollama AI connesso su http://localhost:11434)
```

## ⚠️ IMPORTANTE
- Lascia la finestra con `ollama serve` APERTA mentre il bot è in esecuzione
- Se chiudi quella finestra, l'AI si disattiverà (ma il bot funzionerà comunque in modalità fallback)

## 🎯 Test AI
Una volta attivo Ollama, prova su Discord:
```
/partner-ai partnership_id:qualsiasi_id
```

L'AI analizzerà il profilo con LLaMA 2! 🤖
