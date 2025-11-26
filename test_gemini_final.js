require('dotenv').config();
const conversationalAI = require('./src/ai/conversationalAI');

async function testAI() {
    console.log('--- Test MinfoAI (Gemini 2.0 Flash) ---');
    try {
        const response = await conversationalAI.askQuestion('Come funziona il sistema di partnership?');
        console.log('\n📝 Risposta ricevuta:\n', response);
    } catch (err) {
        console.error('❌ Errore:', err);
    }
}

testAI();
