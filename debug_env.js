require('dotenv').config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const mongoUri = process.env.MONGODB_URI;

console.log('--- ENV DEBUG ---');
if (!token) {
    console.log('TOKEN: MISSING');
} else if (token === 'inserisci_qui_il_tuo_token') {
    console.log('TOKEN: PLACEHOLDER (User did not update)');
} else {
    console.log(`TOKEN: PRESENT (Length: ${token.length})`);
}

if (!clientId) {
    console.log('CLIENT_ID: MISSING');
} else if (clientId === 'inserisci_qui_il_tuo_client_id') {
    console.log('CLIENT_ID: PLACEHOLDER (User did not update)');
} else {
    console.log(`CLIENT_ID: PRESENT`);
}

console.log(`MONGO: ${mongoUri ? 'PRESENT' : 'MISSING'}`);
console.log('-----------------');
