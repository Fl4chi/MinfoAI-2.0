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

        // Saluti e Intro
        if (q.match(/\b(ciao|salve|buongiorno|buonasera|ehi|hello|hi|start|inizio)\b/)) return 'bot_info';
        if (q.includes('minfoai') || q.includes('chi sei') || q.includes('cosa fai') || q.includes('presentati')) return 'bot_info';

        // Partnership Features
        if ((q.includes('che') || q.includes('quale')) && q.includes('partnership') && (q.includes('fare') || q.includes('puo') || q.includes('gestire'))) return 'bot_partnership_features';
        if (q.includes('funzionalita') && q.includes('partnership')) return 'bot_partnership_features';

        // Approval/Rejection
        if (q.includes('approv') || q.includes('accetta') || q.includes('requisiti')) return 'partnership_approval';
        if (q.includes('rifiut') || q.includes('reject') || q.includes('negata')) return 'partnership_reject';

        // Actions
        if (q.includes('creare') || q.includes('richiedere') || q.includes('nuova partnership')) return 'create_partnership';
        if (q.includes('vedere') || q.includes('lista') || q.includes('elenco')) return 'view_partnerships';
        if (q.includes('trovare') || q.includes('cercare') || q.includes('match')) return 'find_partners';

        // Help & Config
        if (q.includes('comando') || q.includes('comandi') || q.includes('lista comandi')) return 'commands';
        if (q.includes('setup') || q.includes('configur') || q.includes('install')) return 'setup_help';
        if (q.includes('errore') || q.includes('bug') || q.includes('non funziona')) return 'troubleshooting';

        // Systems
        if (q.includes('tier') || q.includes('livello') || q.includes('rank') || q.includes('bronze')) return 'tier_system';
        if (q.includes('trust') || q.includes('score') || q.includes('punteggio') || q.includes('affidabil')) return 'trust_score';

        // Advice
        if (q.includes('crescere') || q.includes('migliorare') || q.includes('consigli') || q.includes('aumentare')) return 'server_improvement';
        if (q.includes('esempio')) return 'examples';

        // Tech/Meta
        if (q.includes('ai') || q.includes('intelligenza') || q.includes('bot') || q.includes('tecnologia') || q.includes('svilupp')) return 'ai_tech';

        return 'general';
    }

    getFallbackResponse(question, context, category) {
        const lang = context.language || 'it';

        // bot_info multilingua
        if (category === 'bot_info') {
            const multilingualBotInfo = {
                it: `**Ciao!** 👋 Sono MinfoAI, il tuo assistente personale per le partnership.\n\nIl mio lavoro è semplice: ti aiuto a far crescere il tuo server trovando le collaborazioni giuste, senza farti perdere tempo con spam o server inattivi.\n\n**Cosa posso fare per te:**\n• **Trovare Partner:** Analizzo il tuo server e ti suggerisco community compatibili (es. se hai un server gaming, ti trovo altri server gaming seri).\n• **Gestire Richieste:** Automatizzo tutto il processo di richiesta e approvazione.\n• **Valutare Affidabilità:** Uso un sistema di Trust Score per dirti se un partner è affidabile.\n\n**Esempio al volo:**\nImmagina di avere un ${getRandomExample()}. Io ti trovo subito altri server simili con cui fare eventi o scambi, così crescete insieme.\n\nSe vuoi iniziare subito a configurare il sistema, scrivi \`/setup\`!`,

                en: `**Hello!** 👋 I'm MinfoAI, your personal partnership assistant.\n\nMy job is simple: I help you grow your server by finding the right collaborations, without wasting time on spam or inactive servers.\n\n**What I can do for you:**\n• **Find Partners:** I analyze your server and suggest compatible communities.\n• **Manage Requests:** I automate the entire request and approval process.\n• **Evaluate Reliability:** I use a Trust Score system to tell you if a partner is reliable.\n\n**Quick example:**\nImagine you have a ${getRandomExample()}. I immediately find you other similar servers to do events or exchanges with, so you grow together.\n\nTo start configuring the system right away, type \`/setup\`!`,

                es: `**¡Hola!** 👋 Soy MinfoAI, tu asistente personal de asociaciones.\n\nMi trabajo es simple: te ayudo a hacer crecer tu servidor encontrando las colaboraciones adecuadas.\n\n**Lo que puedo hacer:**\n• **Encontrar Socios:** Analizo tu servidor y sugiero comunidades compatibles.\n• **Gestionar Solicitudes:** Automatizo todo el proceso.\n• **Evaluar Confiabilidad:** Uso un Trust Score para decirte si un socio es confiable.\n\n**Ejemplo rápido:**\nImagina que tienes un ${getRandomExample()}. Te encuentro otros servidores similares para crecer juntos.\n\n¡Para empezar escribe \`/setup\`!`,

                fr: `**Bonjour!** 👋 Je suis MinfoAI, votre assistant personnel de partenariats.\n\nMon travail est simple : je vous aide à développer votre serveur en trouvant les bonnes collaborations.\n\n**Ce que je peux faire:**\n• **Trouver des Partenaires:** J'analyse votre serveur et suggère des communautés compatibles.\n• **Gérer les Demandes:** J'automatise tout le processus.\n• **Évaluer la Fiabilité:** J'utilise un Trust Score pour la fiabilité.\n\n**Exemple rapide:**\nImaginez que vous avez un ${getRandomExample()}. Je vous trouve d'autres serveurs similaires pour grandir ensemble.\n\nPour commencer tapez \`/setup\`!`,

                de: `**Hallo!** 👋 Ich bin MinfoAI, dein persönlicher Partnerschafts-Assistent.\n\nMein Job ist einfach: Ich helfe dir, deinen Server durch die richtigen Kooperationen wachsen zu lassen.\n\n**Was ich tun kann:**\n• **Partner finden:** Ich analysiere deinen Server und schlage kompatible Communities vor.\n• **Anfragen verwalten:** Ich automatisiere den gesamten Prozess.\n• **Zuverlässigkeit bewerten:** Ich nutze einen Trust Score.\n\n**Schnelles Beispiel:**\nStell dir vor, du hast einen ${getRandomExample()}. Ich finde ähnliche Server für dich.\n\nZum Starten tippe \`/setup\`!`
            };

            return multilingualBotInfo[lang] || multilingualBotInfo.it;
        }

        // Resto risposte (solo italiano)
        const responses = {
            bot_partnership_features: `Ti spiego come gestisco le partnership in modo professionale.\n\nNon sono un semplice bot che posta messaggi. Io **gestisco l'intero ciclo di vita** di una collaborazione:\n\n1. **Analisi:** Quando arriva una richiesta, controllo se il server rispetta i requisiti (membri, attività, qualità).\n2. **Matchmaking:** Se cerchi partner, uso il comando \`/partner-match\` per trovarti server simili al tuo (per lingua, tema e dimensione).\n3. **Classificazione:** Assegno un Tier (Bronze, Silver, Gold, Platinum) in base alla qualità della partnership.\n4. **Monitoraggio:** Tengo d'occhio se la partnership viene mantenuta o se il link scade.\n\nÈ come avere un Partnership Manager umano, ma attivo 24/7.`,

            partnership_approval: `Per far approvare una partnership, cerchiamo **qualità** più che quantità.\n\nEcco cosa guardiamo di solito:\n• **Attività Reale:** 500 membri veri che chattano valgono più di 5000 bot offline.\n• **Presentazione:** La descrizione deve far venire voglia di entrare. Evita "entrate pls", scrivi "Siamo una community di X che fa Y ogni settimana".\n• **Affidabilità:** Il server deve avere un Trust Score decente (sopra i 40 punti).\n\nSe la tua richiesta rispetta questi standard, usa \`/partnership-request\` e vedrai che sarà accettata velocemente!`,

            partnership_reject: `Se una richiesta viene rifiutata, non prenderla sul personale! Serve a mantenere alta la qualità per tutti.\n\nDi solito i motivi sono:\n1. **Descrizione troppo breve:** Non si capisce cosa fa il server.\n2. **Link scaduto:** L'invito non funziona più.\n3. **Community inattiva:** Se l'ultimo messaggio in chat risale a un mese fa, è difficile collaborare.\n\nIl bello è che puoi sistemare queste cose e riprovare. Migliora la descrizione, riattiva la chat e manda una nuova richiesta!`,

            create_partnership: `Ottimo, vuoi espandere il network! Creare una richiesta è super intuitivo.\n\nUsa il comando \`/partnership-request\`. Ti chiederò:\n• Il nome del tuo server\n• Quanti membri hai\n• Una bella descrizione (qui giocatela bene!)\n• Il link di invito\n\nUna volta inviata, il mio sistema la processa e la notifica allo staff dell'altro server. Se accettano, la partnership è attiva!\n\n**Consiglio:** Sii onesto sui numeri. Le partnership migliori nascono dalla trasparenza.`,

            view_partnerships: `Per tenere tutto sotto controllo hai diversi strumenti:\n\n• \`/partnership-list\`: Ti mostra l'elenco completo di chi collabora con te.\n• \`/partnership-view [ID]\`: Ti da la scheda tecnica dettagliata di una singola partnership.\n• \`/partnership-stats\`: Ti da i numeri globali (quante partnership hai, di che livello sono, ecc).\n\nÈ tutto a portata di mano, niente più fogli Excel disordinati!`,

            commands: `Ecco gli strumenti principali che hai a disposizione:\n\n🔧 **Gestione:**\n• \`/setup\`: Configura il bot (fallo subito se non l'hai fatto!)\n• \`/partnership-request\`: Invia una proposta\n\n📊 **Controllo:**\n• \`/partnership-list\`: Vedi i tuoi partner\n• \`/partnership-stats\`: Analisi dati\n\n🤝 **Staff:**\n• \`/partnership-approve\` / \`/partnership-reject\`: Gestisci le richieste in arrivo\n• \`/partner-match\`: Trova nuovi amici\n\nSe hai dubbi su uno specifico, chiedimi pure "come funziona il comando X"!`,

            setup_help: `Il \`/setup\` è il primo passo fondamentale. Ci metti letteralmente un minuto.\n\nQuando lo lanci, ti chiederò solo di scegliere:\n1. **Canale Partnership:** Dove vuoi che pubblichi le partnership accettate.\n2. **Ruolo Staff:** Chi può accettare/rifiutare le richieste.\n3. **Canale Log:** Dove scrivo cosa succede (richieste, errori, avvisi).\n\nFatto questo, sono operativo al 100%. Se sbagli qualcosa, rilancia il comando e sovrascrivi tutto. Facile!`,

            tier_system: `Il sistema a Tier serve a premiare i partner migliori. Non tutte le collaborazioni sono uguali!\n\n🥉 **Bronze:** Partnership base.\n🥈 **Silver:** Partner affidabili (+10% visibilità).\n🥇 **Gold:** Partner storici o molto attivi (+25% visibilità).\n💎 **Platinum:** L'élite. I migliori server con cui collabori (+50% visibilità).\n\nLo staff può promuovere i server con \`/partner-tier\`. È un ottimo modo per incentivare gli altri a impegnarsi di più!`,

            trust_score: `Il **Trust Score** è la reputazione del tuo server. Parte da **50/100**.\n\n• **Come sale:** Ogni partnership conclusa con successo, ogni mese di attività senza problemi.\n• **Come scende:** Se spammi, se il link scade e non lo aggiorni, se ricevi segnalazioni.\n\nSopra i **70 punti** sei considerato un partner Premium. Sotto i **40**, potresti avere difficoltà a trovare nuove collaborazioni. Tienilo alto!`,

            server_improvement: `Vuoi crescere? La regola d'oro è: **Contenuto > Spam**.\n\nInvece di mandare inviti a caso, cerca 3-4 server simili al tuo (usa \`/partner-match\` per questo!) e proponi un evento insieme. \n\n**Esempio:** Se hai un server di arte, trova un server di musica e fate un contest "Disegna la copertina dell'album".\n\nQuesto porta utenti attivi e interessati, non numeri vuoti. Io sono qui proprio per aiutarti a trovare quei 3-4 server giusti.`,

            find_partners: `Per trovare nuovi partner hai tre strade:\n\n1. **La via Smart:** Usa \`/partner-match\`. Analizzo il tuo server e ti dico "Ehi, questo server è simile al tuo, dovreste collaborare!".\n2. **La via Manuale:** Usa \`/partnership-list\` per vedere chi è già partner e magari rafforzare il legame.\n3. **La via Social:** Entra nelle community che ti suggerisco e presentati.\n\nRicorda: meglio 1 partner attivo che 10 morti. Punta sulla qualità.`,

            troubleshooting: `Se qualcosa non va, non preoccuparti. Di solito è una sciocchezza.\n\n1. **Controlla il Setup:** Lancia \`/setup\` e verifica che i canali siano giusti.\n2. **Permessi:** Controlla che io abbia il permesso di scrivere in quei canali e di gestire i ruoli.\n3. **Log:** Guarda il canale che hai impostato per i log, spesso scrivo lì qual è il problema.\n\nSe proprio non ne vieni a capo, usa \`/partnership-report\` e descrivi il problema, così il mio sviluppatore può controllare!`,

            examples: `Ti faccio qualche esempio concreto di come posso esserti utile:\n\n**Scenario A: Vuoi crescere**\nHai un server di 600 membri. Usi \`/partner-match\`, trovo un altro server di 550 membri simile. Fate una partnership, organizzate un torneo insieme, e entrambi guadagnate 50 membri attivi.\n\n**Scenario B: Troppe richieste**\nTi arrivano 10 richieste al giorno. Invece di impazzire, io le filtro. Quelle con link scaduti o pochi membri le blocco o le segnalo, tu vedi solo quelle valide su \`/partnership-request\`.\n\nÈ come avere il pilota automatico!`,

            ai_tech: `La mia intelligenza è sviluppata internamente dal team di **Flachi**. \n\nNon uso sistemi esterni standard, sono un modello progettato specificamente per capire le dinamiche dei server Discord e delle community.\n\nIl mio obiettivo non è solo "rispondere", ma capire cosa serve al tuo server per crescere. Sono in continuo aggiornamento, quindi divento più intelligente ogni giorno!`,

            general: `Ciao! Sembra che tu voglia sapere qualcosa sulle partnership o su come migliorare il server, ma non ho capito esattamente cosa.\n\nSono qui apposta! Puoi chiedermi cose come:\n• "Come faccio a trovare nuovi partner?"\n• "Spiegami come funziona il Trust Score"\n• "Perché la mia richiesta è stata rifiutata?"\n\n**Facciamo così:**\nImmagina che io sia un consulente esperto seduto qui con te. Qual è il problema principale del tuo server oggi? Scrivimelo e vediamo di risolverlo insieme!`
        };

        return responses[category] || responses.general;
    }
}

module.exports = new ConversationalAI();
