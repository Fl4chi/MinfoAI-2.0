const axios = require('axios');

class ConversationalAI {
    async askQuestion(question, context = {}) {
        try {
            console.log(`\n[AI] Domanda: "${question.substring(0, 80)}"`);

            // Prova Ollama
            try {
                console.log(`[AI] Tentativo Ollama...`);
                const response = await this.askOllama(question);
                console.log(`[AI] Ollama response:`, response ? `"${response.substring(0, 100)}..."` : 'NULL');

                if (response && response.length > 10) {
                    console.log(`[AI] ✅ Risposta Ollama OK (${response.length} chars)`);
                    return response + '\n\n-# 💬 Usa `/ai-help` per altre domande!';
                } else {
                    console.log(`[AI] ⚠️ Risposta Ollama troppo corta o null`);
                }
            } catch (err) {
                console.error(`[AI] ❌ Ollama fallito:`, err.message);
            }

            // Fallback semplice
            console.log(`[AI] 🔄 Uso fallback`);
            return this.getSimpleFallback(question);

        } catch (error) {
            console.error(`[AI] Errore generale:`, error.message);
            return 'Scusa, ho avuto un problema tecnico. Riprova!';
        }
    }

    async askOllama(question) {
        // Prova prima /api/generate (vecchio), poi /api/chat (nuovo)
        try {
            const response = await axios.post('http://localhost:11434/api/generate', {
                model: 'llama3.2:1b',
                prompt: `Sei MinfoAI, assistente Discord per partnership. Comandi: /partner, /shop, /wallet, /stats. Rispondi in italiano, max 3 righe, tono amichevole.\n\nDomanda: ${question}\nRisposta:`,
                stream: false,
                options: {
                    temperature: 0.7,
                    num_predict: 150
                }
            }, { timeout: 12000 });

            if (response.data && response.data.response) {
                return response.data.response.trim();
            }
        } catch (err) {
            // Se /api/generate fallisce, prova /api/chat
            if (err.response && err.response.status === 404) {
                console.log(`[AI] /api/generate non disponibile, provo /api/chat...`);

                const response = await axios.post('http://localhost:11434/api/chat', {
                    model: 'llama3.2:1b',
                    messages: [
                        {
                            role: 'system',
                            content: 'Sei MinfoAI, assistente Discord per partnership. Comandi: /partner, /shop, /wallet, /stats. Rispondi in italiano, max 3 righe, tono amichevole.'
                        },
                        {
                            role: 'user',
                            content: question
                        }
                    ],
                    stream: false
                }, { timeout: 12000 });

                if (response.data && response.data.message && response.data.message.content) {
                    return response.data.message.content.trim();
                }
            } else {
                throw err;
            }
        }

        return null;
    }

    getSimpleFallback(question) {
        const q = question.toLowerCase();

        if (q.includes('ciao') || q.includes('chi sei') || q.includes('come stai')) {
            return 'Ciao! Sono MinfoAI, ti aiuto con le partnership del server. Usa `/partner request` per iniziare o chiedi pure!';
        }
        if (q.includes('comando') || q.includes('comandi') || q.includes('help')) {
            return 'Comandi: `/partner` (partnership), `/shop` (boost e tier), `/wallet` (coins), `/stats` (statistiche). Cosa ti serve?';
        }
        if (q.includes('shop') || q.includes('boost') || q.includes('tier')) {
            return 'Nello `/shop` trovi boost (200-500 coins) e tier upgrade (Silver 1000, Gold 2500, Platinum 5000). I tier danno vantaggi permanenti!';
        }
        if (q.includes('coin') || q.includes('wallet') || q.includes('soldi')) {
            return 'Usa `/wallet` per vedere i tuoi coins. Li guadagni con partnership approvate e li spendi nello `/shop`!';
        }
        if (q.includes('setup') || q.includes('configur')) {
            return 'Usa `/setup` per configurare: canale partnership, ruolo staff, canale log. Fatto in 1 minuto!';
        }
        if (q.includes('partnership') || q.includes('partner')) {
            return 'Usa `/partner request` per richiedere una partnership. Gli admin la approveranno e guadagnerai coins!';
        }
        if (q.includes('trust') || q.includes('score')) {
            return 'Il Trust Score misura l\'affidabilità del server (0-100). Più partnership attive hai, più alto è. Vedi il tuo con `/stats`!';
        }

        return 'Non ho capito bene. Prova a chiedere "come funziona lo shop" o "cosa sono i comandi"!';
    }
}

module.exports = new ConversationalAI();
