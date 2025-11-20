/**
 * Conversational AI Module - Multilingual with comprehensive logging
 */

const errorLogger = require('../utils/errorLogger');

// Pool esempi vari e realistici
const EXAMPLES_POOL = [
    "piccolo server di 200 persone appassionati di fotografia e vuoi crescere collaborando con community creative",
    "community musicale con 850 membri che organizza jam session online ogni weekend",
    "server di gaming competitivo con team eSports che cerca altri clan per scrim tornei",
    "gruppo di sviluppatori indie che lavora su progetti open source e cerca beta tester",
    "community italiana di 1500 fan di anime che fa watchalong e discussioni",
    "server educativo per studenti universitari con canali studio e sessioni di gruppo",
    "community artistica dove si condividono WIP e si fa peer review costruttiva",
    "gruppo fitness con personal trainer che offre consulenze gratuite ai membri",
    "server roleplay medievale con lore dettagliata e eventi narrativi settimanali",
    "community crypto/trading con analisi di mercato e segnali condivisi",
    "server podcast dove creator si scambiano ospiti per episodi cross-promotion",
    "gruppo book club che legge un libro al mese e organizza discussioni live",
    "community cosplay con tutorial, photoshoot organizzati e contest mensili",
    "server tech dove si discute di programmazione, AI e nuove tecnologie",
    "gruppo streaming con raid reciproci e collaborazioni tra content creator"
];

function getRandomExample() {
    return EXAMPLES_POOL[Math.floor(Math.random() * EXAMPLES_POOL.length)];
}

// Language detection
function detectLanguage(text) {
    const t = text.toLowerCase();

    if (t.match(/\b(ciao|come|cosa|perch[eé]|quando|dove|aiuto|grazie|per favore)\b/)) return 'it';
    if (t.match(/\b(hola|c[oó]mo|qu[eé]|cu[aá]ndo|d[oó]nde|ayuda|gracias|por favor)\b/)) return 'es';
    if (t.match(/\b(bonjour|comment|quoi|pourquoi|quand|o[uù]|aide|merci|s'il vous pla[iî]t)\b/)) return 'fr';
    if (t.match(/\b(hallo|wie|was|warum|wann|wo|hilfe|danke|bitte)\b/)) return 'de';
    if (t.match(/\b(hello|how|what|why|when|where|help|thanks|please)\b/)) return 'en';

    return 'it';
}

class ConversationalAI {
    async askQuestion(question, context = {}) {
        try {
            console.log(`\n[ConversationalAI] Processing question: "${question.substring(0, 100)}..."`);

            const language = detectLanguage(question);
            context.language = language;
            console.log(`[ConversationalAI] Detected language: ${language}`);
            errorLogger.logInfo(`Language detected: ${language}`, 'AI_LANG_DETECT');

            const category = this.categorizeQuestion(question);
            console.log(`[ConversationalAI] Category: ${category}`);
            errorLogger.logInfo(`Question categorized as: ${category}`, 'AI_CATEGORIZE');

            const response = this.getFallbackResponse(question, context, category);
            context.detectedCategory = category;

            const reminders = {
                it: '\n\n-# 💬 Usa `/ai-help` per continuare a chattare con me!',
                en: '\n\n-# 💬 Use `/ai-help` to continue chatting!',
                es: '\n\n-# 💬 Usa `/ai-help` para continuar!',
                fr: '\n\n-# 💬 Utilisez `/ai-help` pour continuer!',
                de: '\n\n-# 💬 Verwende `/ai-help` zum Weiterchatten!'
            };

            console.log(`[ConversationalAI] Response generated (${response.length} chars)`);
            errorLogger.logInfo(`AI response success (${response.length} chars)`, 'AI_RESPONSE_OK');

            return response + (reminders[language] || reminders.it);
        } catch (error) {
            console.error(`[ConversationalAI] ERROR:`, error);
            errorLogger.logError('ERROR', 'Errore conversational AI', 'CONV_AI_ERROR', error);
            return 'Mi dispiace, c\'è stato un problemino tecnico. Riprova!\n\n-# 💬 Usa `/ai-help` per altre domande!';
        }
    }

    categorizeQuestion(question) {
        const q = question.toLowerCase();

        if (q.includes('minfoai') || q.includes('cosa fa') || q.includes('cosa puo') || q.includes('che bot')) return 'bot_info';

        if ((q.includes('che') || q.includes('quale')) && q.includes('partnership') && (q.includes('fare') || q.includes('puo') || q.includes('gestire'))) {
            return 'bot_partnership_features';
        }
        if (q.includes('funzionalita') && q.includes('partnership')) return 'bot_partnership_features';

        if (q.includes('approv') || q.includes('accetta') || q.includes('requisiti')) return 'partnership_approval';
        if (q.includes('rifiut') || q.includes('reject')) return 'partnership_reject';

        if (q.includes('creare partnership') || q.includes('fare partnership')) return 'create_partnership';
        if (q.includes('veder') && q.includes('partnership')) return 'view_partnerships';

        if (q.includes('comando') || q.includes('come uso') || q.includes('come si usa')) return 'commands';
        if (q.includes('/setup') || q.includes('configurare') || q.includes('configurazione')) return 'setup_help';

        if (q.includes('tier') || q.includes('livello') || q.includes('bronze') || q.includes('silver') || q.includes('gold') || q.includes('platinum')) return 'tier_system';
        if (q.includes('trust') || q.includes('score') || q.includes('punteggio') || q.includes('reputazione')) return 'trust_score';

        if (q.includes('crescere') || q.includes('migliorare') || q.includes('aumentare membri') || q.includes('far crescere')) return 'server_improvement';
        if (q.includes('trovare') && (q.includes('partner') || q.includes('server'))) return 'find_partners';

        if (q.includes('errore') || q.includes('problema') || q.includes('non funziona') || q.includes('bug')) return 'troubleshooting';
        if (q.includes('esempio') || q.includes('per esempio')) return 'examples';

        if ((q.includes('che') || q.includes('quale')) && (q.includes('ai') || q.includes('intelligenza'))) return 'ai_tech';
        if (q.includes('ollama') || q.includes('llama') || q.includes('tecnologia')) return 'ai_tech';

        return 'general';
    }

    getFallbackResponse(question, context, category) {
        const lang = context.language || 'it';

        // bot_info multilingua
        if (category === 'bot_info') {
            const multilingualBotInfo = {
                it: `**Ciao!** Sono qui per aiutarti a gestire le **partnership** del tuo server Discord.\n\nPensa a me come quel amico esperto che ti da una mano quando devi trovare collaborazioni serie e far crescere la community.\n\n**Ti faccio un esempio pratico:**\nMettiamo che hai un ${getRandomExample()}. Io ti aiuto a trovare quelli giusti, valutare se sono affidabili, e tenere tutto organizzato.\n\nNon dovrai più perdere tempo con richieste spam o partnership che non portano a nulla.\n\n**Sistema di classificazione:**\n\`Bronze\` → \`Silver\` → \`Gold\` → \`Platinum\`\n\nCosì puoi dare priorità alle collaborazioni più importanti. Tengo traccia di tutto, hai sempre sott'occhio come stanno andando le cose.\n\n→ Per iniziare usa \`/setup\` (sono letteralmente due minuti)`,

                en: `**Hello!** I'm here to help you manage **partnerships** for your Discord server.\n\nThink of me as that expert friend who helps you find serious collaborations and grow your community.\n\n**Practical example:**\nLet's say you have a ${getRandomExample()}. I help you find the right ones, evaluate reliability, and keep everything organized.\n\nNo more wasting time with spam requests or partnerships that lead nowhere.\n\n**Classification system:**\n\`Bronze\` → \`Silver\` → \`Gold\` → \`Platinum\`\n\nSo you can prioritize the most important collaborations. I keep track of everything.\n\n→ To start use \`/setup\` (literally two minutes)`,

                es: `**¡Hola!** Est

oy aquí para ayudarte a gestionar **asociaciones** para tu servidor Discord.\n\nPiensa en mí como ese amigo experto que te ayuda a encontrar colaboraciones serias y hacer crecer tu comunidad.\n\n**Ejemplo práctico:**\nDigamos que tienes un ${getRandomExample()}. Te ayudo a encontrar los correctos, evaluar confiabilidad y mantener todo organizado.\n\nNo más perder tiempo con solicitudes spam.\n\n**Sistema de clasificación:**\n\`Bronze\` → \`Silver\` → \`Gold\` → \`Platinum\`\n\nAsí puedes priorizar las colaboraciones importantes. Hago seguimiento de todo.\n\n→ Para empezar usa \`/setup\` (literalmente dos minutos)`,

                fr: `**Bonjour!** Je suis là pour vous aider à gérer les **partenariats** de votre serveur Discord.\n\nPensez à moi comme cet ami expert qui vous aide à trouver des collaborations sérieuses.\n\n**Exemple pratique:**\nDisons que vous avez un ${getRandomExample()}. Je vous aide à trouver les bons, évaluer la fiabilité et tout garder organisé.\n\nPlus de temps perdu avec spam.\n\n**Système:**\n\`Bronze\` → \`Silver\` → \`Gold\` → \`Platinum\`\n\nPour commencer: \`/setup\``,

                de: `**Hallo!** Ich helfe dir, **Partnerschaften** für deinen Discord-Server zu verwalten.\n\nDenk an mich als Experten-Freund für ernsthafte Kooperationen.\n\n**Beispiel:**\nDu hast einen ${getRandomExample()}. Ich helfe dir, die richtigen zu finden.\n\nKeine Zeitverschwendung.\n\n**System:**\n\`Bronze\` → \`Silver\` → \`Gold\` → \`Platinum\`\n\nStarten: \`/setup\``
            };

            return multilingualBotInfo[lang] || multilingualBotInfo.it;
        }

        // Resto risposte (solo italiano)
        const responses = {
            bot_partnership_features: `Perfetto! Ti spiego esattamente **che tipo di partnership** gestisco.\n\n**Creazione Partnership**\nTu mandi richiesta con \`/partnership-request\`, io processo e sottopongo allo staff.\n\n**Matchmaking Automatico**\nCon \`/partner-match\` analizzo il tuo server (membri, tematica, lingua) e trovo compatibili.\n\n**Gestione Tier**\n\`Bronze\` \`Silver\` \`Gold\` \`Platinum\` - ogni tier ha vantaggi diversi.\n\n**Trust Score System**\nTraccia affidabilità (parti da 50/100).\n\n**Monitoraggio**\n\`/partnership-list\` e \`/partnership-stats\`\n\nCiclo: creazione → matchmaking → approvazione → classificazione → monitoraggio`,

            partnership_approval: `Per richiesta **accettata:**\n\n**Requisiti:**\n• Minimo **500 persone** attive\n• Community vera\n\n**Presentazione:**\n❌ "bel server"\n✅ "Server gaming IT, tornei weekend, 800 attivi"\n\n**Altri:**\n• Link funzionante\n• Trust score 40+\n\nUsa \`/partnership-request\``,

            partnership_reject: `Rifiuto = motivo specifico sistemabile.\n\n**Problemi comuni:**\n• Membri insufficienti\n• Descrizione generica\n• Link morto\n• Score basso\n\nPuoi riprovare dopo fix. Non è NO permanente.\n\nErrore? \`/partnership-report\``,

            create_partnership: `Semplice!\n\n1. \`/partnership-request\`\n2. Compila bene\n\n**Consiglio:** descrizione dettagliata su server, attività, community.\n\nStaff valuta → se ok = approvata`,

            view_partnerships: `\`/partnership-list\` - tutte\n\`/partnership-view [ID]\` - dettagli\n\`/partnership-stats\` - numeri`,

            commands: `**Comandi:**\n\`/setup\` - configura\n\`/partnership-request\` - richiedi\n\`/partnership-list\` - vedi attive\n\`/partner-match\` - trova\n\`/partnership-approve\` - approva (staff)\n\`/partnership-reject\` - rifiuta (staff)\n\`/partner-tier\` - cambia livello (staff)`,

            setup_help: `\`/setup\` - iniziale.\n\n3 cose:\n1. Canale Partnership\n2. Ruolo Staff\n3. Canale Log\n\n2 minuti. Puoi rifare per riconfigurare.\n\n**Permessi:** Administrator o gestire canali + messaggi`,

            tier_system: `Tier = punti fedeltà.\n\n🥉 Bronze - base\n🥈 Silver - +10% XP\n🥇 Gold - +25% XP\n💎 Platinum - +50% XP\n\nGestisci: \`/partner-tier\``,

            trust_score: `Trust = reputazione.\n\n${context.trustScore ? `Tuo: \`${context.trustScore}/100\`` : 'Parti: \`50/100\`'}\n\n• Partnership ok → +10\n• Problemi → -10/-20\n\n**70+** = premium\n**<40** = controllo\n**40** = soglia minima`,

            server_improvement: `Crescita = strategia.\n\n300 → 1000?\n\n❌ NO: spam\n✅ SI: 3-4 server simili\n\nOrganizza: contest, eventi.\n\n\`/partner-match\` per trovare.\n\n10 fatte bene > 100 random`,

            find_partners: `**#1:** \`/partner-match\` - auto\n**#2:** \`/partnership-list\` - attive\n**#3:** Partecipa community, contatta\n\n200 attivi > 2000 morti`,

            troubleshooting: `Problema?\n\n1. \`/setup\` - verifica\n2. Permessi bot\n3. Canale log\n\nAncora? \`/partnership-report\` + spiega`,

            examples: `**#1:**\n600 membri → match → richiesta → approvato → torneo → crescita\n\n**#2:**\nRichiesta → view → serio → approve → parte\n\n**#3:**\nNon va → delete → cerca nuove`,

            ai_tech: `AI by **Flachi e team**.\n\nFase iniziale, miglioramenti continui.\n\n**Obiettivo:** partnership e consigli.\n\nRisposte migliorabili = normale evoluzione`,

            general: `Ciao! Aiuto partnership e crescita.\n\nChiedi:\n• "Come creo?"\n• "Perché rifiutata?"\n• "Come trovo?"\n\n**Tip:** specifico = utile`
        };

        return responses[category] || responses.general;
    }
}

module.exports = new ConversationalAI();
