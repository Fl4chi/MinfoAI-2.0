const axios = require('axios');
require('dotenv').config();

async function checkAPI() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.log("❌ Nessuna API Key trovata in .env");
        return;
    }

    console.log(`🔑 Controllo chiave: ${key.substring(0, 10)}...`);

    try {
        // Chiamata diretta REST API per listare i modelli
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        console.log(`🌐 Contatto Google API: ${url.replace(key, 'HIDDEN')}`);

        const response = await axios.get(url);

        console.log("\n✅ API CONNESSA CON SUCCESSO!");
        console.log("📜 Modelli disponibili per la tua chiave:");

        const models = response.data.models;
        if (models && models.length > 0) {
            models.forEach(m => {
                if (m.name.includes('gemini')) {
                    console.log(`   - ${m.name.replace('models/', '')}`);
                }
            });
        } else {
            console.log("   ⚠️ Nessun modello trovato (strano).");
        }

    } catch (error) {
        console.log("\n❌ ERRORE API:");
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Dettagli:`, JSON.stringify(error.response.data, null, 2));

            if (error.response.status === 400) {
                console.log("\n💡 SUGGERIMENTO: La chiave potrebbe essere invalida o il progetto non esiste.");
            } else if (error.response.status === 403) {
                console.log("\n💡 SUGGERIMENTO: Permessi negati. Probabilmente devi abilitare 'Generative Language API' nella Google Cloud Console.");
                console.log("   Link: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com");
            }
        } else {
            console.log(`   Errore: ${error.message}`);
        }
    }
}

checkAPI();
