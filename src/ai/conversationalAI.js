const axios = require('axios');

class ConversationalAI {
    async askQuestion(question, context = {}) {
        try {
            console.log(`\n[AI] Domanda: "${question.substring(0, 80)}..."`);

            // Prova Ollama
            try {
                const response = await this.askOllama(question);
                if (response) {
                    console.log(`[AI] Risposta OK (${response.length} chars)`);
                    return response + '\n\n-# 💬 Usa `/ai-help` per altre domande!';
                }
            } catch (err) {
                console.log(`[AI] Ollama non disponibile, uso fallback`);
            }

            // Fallback semplice
            return this.getSimpleFallback(question);

        } catch (error) {
            console.error(`[AI] Errore:`, error.message);
            return 'Scusa, ho avuto un problema tecnico. Riprova!';
        }
    }

    async askOllama(question) {
        const botKnowledge = `Sei MinfoAI, assistente per partnership Discord.

COMANDI DISPONIBILI:
- /partner request: Richiedi partnership
- /partner list: Vedi partnership attive
- /partner view: Dettagli partnership
- /manager approve/reject/delete: Gestione staff
- /shop: Compra boost (1gg=200 coins, 3gg=500 coins) o reset cooldown (500 coins)
- /wallet: Vedi saldo coins
- /stats: Statistiche utente complete
- /setup: Configura bot (canali, ruoli)

FUNZIONALITÀ:
- Trust Score: Reputazione server (50-100, più alto = più affidabile)
- Boost: Riduce cooldown partnership a 24h
- Economy: Guadagni coins con attività, spendi nello shop

RISPONDI:
- Max 2-3 righe
- Tono amichevole come un amico
- NO elenchi puntati
- NO formattazione complessa
- Scrivi in italiano naturale`;

        const prompt = `${botKnowledge}

Domanda utente: ${question}

Risposta breve e naturale:`;

        const response = await axios.post('http://localhost:11434/api/generate', {
            model: 'llama3.2:1b',
            prompt: prompt,
            stream: false,
            options: {
                temperature: 0.8,
                num_predict: 120,
                top_p: 0.9
            }
        }, { timeout: 10000 });

        if (response.data && response.data.response) {
            return response.data.response.trim();
        }
        return null;
    }

    getSimpleFallback(question) {
        const q = question.toLowerCase();

        if (q.includes('ciao') || q.includes('chi sei')) {
            return 'Ciao! Sono MinfoAI, ti aiuto con le partnership del server. Usa `/setup` per iniziare o `/partner request` per richiedere una collaborazione!';
        }
        if (q.includes('comando') || q.includes('comandi')) {
            return 'Comandi principali: `/partner` (partnership), `/shop` (boost e reset), `/wallet` (coins), `/stats` (statistiche). Cosa ti serve?';
        }
        if (q.includes('shop') || q.includes('boost')) {
            return 'Nello `/shop` trovi: Boost 1 giorno (200 coins), Boost 3 giorni (500 coins), Reset cooldown (500 coins). Compra con i tuoi coins!';
        }
        if (q.includes('coin') || q.includes('wallet')) {
            return 'Usa `/wallet` per vedere i tuoi coins. Li guadagni con attività e partnership, li spendi nello `/shop`!';
        }
        if (q.includes('setup') || q.includes('configur')) {
            return 'Lancia `/setup` e scegli: canale partnership, ruolo staff, canale log. Fatto! Ci metti 1 minuto.';
        }

        return 'Non ho capito bene. Prova a riformulare o chiedi tipo "come funziona lo shop" o "cosa sono i comandi"!';
    }
}

module.exports = new ConversationalAI();
