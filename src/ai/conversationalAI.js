/**
 * Conversational AI Module - Multilingual responses with language detection
 */

const errorLogger = require('../utils/errorLogger');

// Pool con esempi VARI e REALISTICI
const EXAMPLES_POOL = [
    "piccolo server di 200 persone appassionati di fotografia e vuoi crescere collaborando con community creative",
    "community musicale con 850 membri che organizza jam session online ogni weekend",
    "server di gaming competitivo con team eSports che cerca altri clan per scrim e tornei",
    "gruppo di sviluppatori indie che lavora su progetti open source e cerca beta tester",
    "community italiana di 1500 fan di anime che fa watchalong e discussioni",
    "server educativo per studenti universitari con canali studio e sessioni di gruppo",
    "community artistica dove si condividono WIP e si fa peer review costruttiva",
    "gruppo fitness con personal trainer che offre consulenze gratuite ai membri",
    "server roleplay medievale con lore detta gliata evento narrativi settimanali",
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

    return 'it'; // default
}

class ConversationalAI {
    async askQuestion(question, context = {}) {
        try {
            const language = detectLanguage(question);
            context.language = language;

            const category = this.categorizeQuestion(question);
            const response = this.getFallbackResponse(question, context, category);

            context.detectedCategory = category;

            const reminders = {
                it: '\n\n-# 💬 Usa `/ai-help` per continuare a chattare con me!',
                en: '\n\n-# 💬 Use `/ai-help` to continue chatting!',
                es: '\n\n-# 💬 Usa `/ai-help` para continuar!',
                fr: '\n\n-# 💬 Utilisez `/ai-help` pour continuer!',
                de: '\n\n-# 💬 Verwende `/ai-help` zum Weiterchatten!'
            };

            return response + (reminders[language] || reminders.it);
        } catch (error) {
            console.error('[conversationalAI] Error:', error.message);
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

        // SOLO bot_info è multilingua per ora, il resto rimane italiano
        if (category === 'bot_info') {
            const multilingualBotInfo = {
                it: `**Ciao!** Sono qui per aiutarti a gestire le **partnership** del tuo server Discord.\n\nPensa a me come quel amico esperto che ti da una mano quando devi trovare collaborazioni serie e far crescere la community.\n\n**Ti faccio un esempio pratico:**\nMettiamo che hai un ${getRandomExample()}. Io ti aiuto a trovare quelli giusti, valutare se sono affidabili, e tenere tutto organizzato.\n\nNon dovrai più perdere tempo con richieste spam o partnership che non portano a nulla.\n\n**Sistema di classificazione:**\n\`Bronze\` → \`Silver\` → \`Gold\` → \`Platinum\`\n\nCosì puoi dare priorità alle collaborazioni più importanti. Tengo traccia di tutto, hai sempre sott'occhio come stanno andando le cose.\n\n→ Per iniziare usa \`/setup\` (sono letteralmente due minuti)`,

                en: `**Hello!** I'm here to help you manage **partnerships** for your Discord server.\n\nThink of me as that expert friend who helps you find serious collaborations and grow your community.\n\n**Practical example:**\nLet's say you have a ${getRandomExample()}. I help you find the right ones, evaluate reliability, and keep everything organized.\n\nNo more wasting time with spam requests or partnerships that lead nowhere.\n\n**Classification system:**\n\`Bronze\` → \`Silver\` → \`Gold\` → \`Platinum\`\n\nSo you can prioritize the most important collaborations. I keep track of everything, you always have an overview.\n\n→ To start use \`/setup\` (literally two minutes)`,

                es: `**¡Hola!** Estoy aquí para ayudarte a gestionar **asociaciones** para tu servidor Discord.\n\nPiensa en mí como ese amigo experto que te ayuda a encontrar colaboraciones serias y hacer crecer tu comunidad.\n\n**Ejemplo práctico:**\nDigamos que tienes un ${getRandomExample()}. Te ayudo a encontrar los correctos, evaluar confiabilidad y mantener todo organizado.\n\nNo más perder tiempo con solicitudes spam o asociaciones que no llevan a ninguna parte.\n\n**Sistema de clasificación:**\n\`Bronze\` → \`Silver\` → \`Gold\` → \`Platinum\`\n\nAsí puedes priorizar las colaboraciones más importantes. Hago seguimiento de todo, siempre tienes una visión general.\n\n→ Para empezar usa \`/setup\` (literalmente dos minutos)`,

                fr: `**Bonjour!** Je suis là pour vous aider à gérer les **partenariats** de votre serveur Discord.\n\nPensez à moi comme cet ami expert qui vous aide à trouver des collaborations sérieuses et à développer votre communauté.\n\n**Exemple pratique:**\nDisons que vous avez un ${getRandomExample()}. Je vous aide à trouver les bons, évaluer la fiabilité et tout garder organisé.\n\nPlus de temps perdu avec des demandes spam ou des partenariats qui ne mènent nulle part.\n\n**Système de classification:**\n\`Bronze\` → \`Silver\` → \`Gold\` → \`Platinum\`\n\nAinsi vous pouvez prioriser les collaborations. Je garde une trace de tout, vous avez toujours un aperçu.\n\n→ Pour commencer utilisez \`/setup\` (littéralement deux minutes)`,

                de: `**Hallo!** Ich bin hier, um dir zu helfen, **Partnerschaften** für deinen Discord-Server zu verwalten.\n\nDenk an mich als diesen Experten-Freund, der dir hilft, ernsthafte Kooperationen zu finden und deine Community wachsen zu lassen.\n\n**Praktisches Beispiel:**\nNehmen wir an, du hast einen ${getRandomExample()}. Ich helfe dir, die richtigen zu finden, Zuverlässigkeit zu bewerten und alles organisiert zu halten.\n\nKeine Zeitverschwendung mehr mit Spam-Anfragen.\n\n**Klassifizierungssystem:**\n\`Bronze\` → \`Silver\` → \`Gold\` → \`Platinum\`\n\nSo kannst du die wichtigsten Kooperationen priorisieren. Ich behalte alles im Blick.\n\n→ Zum Starten verwende \`/setup\` (buchstäblich zwei Minuten)`
            };

            return multilingualBotInfo[lang] || multilingualBotInfo.it;
        }

        // Resto delle risposte (solo italiano per ora)
        const responses = {
            bot_partnership_features: `Perfetto! Ti spiego esattamente **che tipo di partnership** gestisco.\n\n**Creazione Partnership**\nTu mandi richiesta con \`/partnership-request\`, io processo, analizzo validità e sottopongo allo staff per approvazione.\n\n**Matchmaking Automatico**\nCon \`/partner-match\` analizzo il tuo server (quanti membri, che tematica, che lingua) e trovo server compatibili.\n\n**Gestione Tier**\n\`Bronze\` \`Silver\` \`Gold\` \`Platinum\` - ogni tier ha vantaggi diversi. Lo staff cambia tier con \`/partner-tier\`.\n\n**Trust Score System**\nTengo traccia della tua affidabilità (parti da 50/100). Sale se completi partnership bene, scende se ci sono problemi.\n\n**Monitoraggio**\n\`/partnership-list\` e \`/partnership-stats\` per vedere come va tutto.\n\nCiclo completo: creazione → matchmaking → approvazione → classificazione → monitoraggio`,

            partnership_approval: `Se vuoi che la richiesta venga **accettata**, ci sono alcune cose da tenere a mente.\n\n**Requisiti base:**\n• Minimo **500 persone** - ma 500 veri attivi\n• Community vera che chatta e partecipa\n\n**Presentazione:**\n❌ "bel server entra"\n✅ "Server italiano gaming competitivo, tornei ogni weekend, 800 membri attivi"\n\n**Altri requisiti:**\n• Link invito funzionante\n• Trust score minimo 40 punti\n\nQuando sei pronto usa \`/partnership-request\``,

            partnership_reject: `Ricevere un rifiuto non è piacevole, ma solitamente c'è un motivo specifico e si può sistemare.\n\n**Problemi comuni:**\n• Membri insufficienti/inattivi\n• Descrizione troppo generica\n• Link scaduto\n• Trust score sotto soglia\n\nPuoi riprovare dopo aver migliorato. Non è un NO definitivo.\n\nSe pensi sia stato errore: \`/partnership-report\``,

            create_partnership: `Creare una partnership è semplicissimo!\n\n1. Usa \`/partnership-request\`\n2. Compila: nome server, membri, descrizione, link, motivazione\n\n**Consiglio:** scrivi **bene** la descrizione. Spiega cosa rende il server interessante, cosa fate, che community siete.\n\nDopo l'invio, staff valuta → se ok = approvata`,

            view_partnerships: `Per vedere partnership:\n\n\`/partnership-list\` - tutte quelle del server\n\`/partnership-view [ID]\` - dettagli specifici\n\`/partnership-stats\` - numeri globali`,

            commands: `**Comandi:**\n\`/setup\` - configura tutto\n\`/partnership-request\` - richiedi collaborazioni\n\`/partnership-list\` - vedi attive\n\`/partner-match\` - trova compatibili\n\`/partnership-approve\` - approva (staff)\n\`/partnership-reject\` - rifiuta (staff)\n\`/partner-tier\` - cambia livello (staff)\n\nDigita \`/\` su Discord per lista completa`,

            setup_help: `\`/setup\` - comando iniziale.\n\nScegli 3 cose:\n1. Canale Partnership\n2. Ruolo Staff\n3. Canale Log\n\nBot pronto in 2 minuti. Puoi rifare \`/setup\` per riconfigurare.\n\n**Permessi:** \`Administrator\` o gestire canali + messaggi + embed`,

            tier_system: `Tier = punti fedeltà.\n\n🥉 **Bronze** - base\n🥈 **Silver** - +10% XP\n🥇 **Gold** - +25% XP\n💎 **Platinum** - +50% XP\n\nPartnership 100 punti:\n• Bronze → 100\n• Gold → 125\n• Platinum → 150\n\nGestisci con \`/partner-tier\``,

            trust_score: `Trust score = tua reputazione.\n\n${context.trustScore ? `Il tuo: \`${context.trustScore}/100\`` : 'Parti da: \`50/100\`'}\n\n• Partnership completata → +10\n• Problemi/spam → -10/-20\n\n**70+** = premium\n**Under 40** = controllo attento\n**Soglia** = 40 per richiedere\n\nPuoi sempre risalire`,

            server_improvement: `Crescita server = strategia.\n\n300 membri → 1000?\n\n❌ NO: spam inviti random\n✅ SI: 3-4 server pubblico simile\n\nOrganizza insieme: contest, challenge, eventi.\n\nUsa \`/partner-match\` per trovare compatibili.\n\n10 partnership fatte bene > 100 buttate lì`,

            find_partners: `Trovare partner:\n\n**#1:** \`/partner-match\` - automatico\n**#2:** \`/partnership-list\` - già attive\n**#3:** Partecipa community, contatta via \`/partnership-request\`\n\n200 membri attivi > 2000 morti`,

            troubleshooting: `Qualcosa non va?\n\n1. \`/setup\` - verifica config\n2. Controlla permessi bot\n3. Guarda canale log\n\nAncora problemi? \`/partnership-report\` + spiega`,

            examples: `**Esempio #1:**\nServer gaming 600 → \`/partner-match\` → trova 3 → \`/partnership-request\` → approvato → torneo insieme → crescita\n\n**Esempio #2:**\nRichiesta → \`/partnership-view\` → serio → \`/partnership-approve\` → parte\n\n**Esempio #3:**\nNon funziona → \`/partnership-delete\` → cerca nuove`,

            ai_tech: `AI sviluppata da **Flachi e team**.\n\nFase iniziale, miglioramenti continui.\n\n**Obiettivo:** gestire partnership e dare consigli.\n\nSe risposte migliorabili = normale, è evoluzione continua`,

            general: `Ciao! Aiuto con partnership e crescita server.\n\nChiedimi:\n• "Come creo partnership?"\n• "Perché rifiutata?"\n• "Come trovo compatibili?"\n• Altro\n\n**Pro tip:** più specifico = risposta utile\n\nCosa serve?`
        };

        return responses[category] || responses.general;
    }
}

module.exports = new ConversationalAI();
