/**
 * Conversational AI Module - Risposte italiane naturali e specifiche
 */

const errorLogger = require('../utils/errorLogger');

class ConversationalAI {
    async askQuestion(question, context = {}) {
        try {
            const category = this.categorizeQuestion(question);
            const response = this.getFallbackResponse(question, context, category);

            // Aggiungi reminder per continuare la conversazione (formato Discord subtext)
            return response + '\n\n-# 💬 Usa `/ai-help` per continuare a chattare con me!';
        } catch (error) {
            errorLogger.logError('ERROR', 'Errore conversational AI', 'CONV_AI_ERROR', error);
            return 'Mi dispiace, c\'è stato un problemino tecnico. Riprova tra un attimo!\n\n-# 💬 Usa `/ai-help` per fare altre domande!';
        }
    }

    categorizeQuestion(question) {
        const q = question.toLowerCase();

        // Domande specifiche sul bot
        if (q.includes('minfoai') || q.includes('cosa fa') || q.includes('cosa puo') || q.includes('che bot')) return 'bot_info';

        // Domande SPECIFICHE sulle partnership che il BOT può fare
        if ((q.includes('che') || q.includes('quale')) && q.includes('partnership') && (q.includes('fare') || q.includes('puo') || q.includes('gestire'))) {
            return 'bot_partnership_features';
        }
        if (q.includes('funzionalita') && q.includes('partnership')) return 'bot_partnership_features';

        // Partnership - approvazione
        if (q.includes('approv') || q.includes('accetta') || q.includes('requisiti')) return 'partnership_approval';
        if (q.includes('rifiut') || q.includes('reject')) return 'partnership_reject';

        // Partnership - gestione
        if (q.includes('creare partnership') || q.includes('fare partnership')) return 'create_partnership';
        if (q.includes('veder') && q.includes('partnership')) return 'view_partnerships';

        // Comandi
        if (q.includes('comando') || q.includes('come uso') || q.includes('come si usa')) return 'commands';
        if (q.includes('/setup') || q.includes('configurare') || q.includes('configurazione')) return 'setup_help';

        // Tier system
        if (q.includes('tier') || q.includes('livello') || q.includes('bronze') || q.includes('silver') || q.includes('gold') || q.includes('platinum')) return 'tier_system';

        // Trust score
        if (q.includes('trust') || q.includes('score') || q.includes('punteggio') || q.includes('reputazione')) return 'trust_score';

        // Crescita server
        if (q.includes('crescere') || q.includes('migliorare') || q.includes('aumentare membri') || q.includes('far crescere')) return 'server_improvement';

        // Trovare partner
        if (q.includes('trovare') && (q.includes('partner') || q.includes('server'))) return 'find_partners';

        // Problemi tecnici
        if (q.includes('errore') || q.includes('problema') || q.includes('non funziona') || q.includes('bug')) return 'troubleshooting';

        // Esempi pratici
        if (q.includes('esempio') || q.includes('per esempio')) return 'examples';

        // Domanda su che AI è
        if ((q.includes('che') || q.includes('quale')) && (q.includes('ai') || q.includes('intelligenza'))) return 'ai_tech';
        if (q.includes('ollama') || q.includes('llama') || q.includes('tecnologia')) return 'ai_tech';

        return 'general';
    }

    getFallbackResponse(question, context, category) {
        const responses = {
            bot_info: `Ciao! Sono qui per aiutarti a gestire le partnership del tuo server Discord. Pensa a me come quel amico esperto che ti da una mano quando devi trovare collaborazioni serie e far crescere la community.\n\nTi faccio un esempio: mettiamo che hai un server gaming con 400 persone e vorresti collaborare con altri server simili. Io ti aiuto a trovare quelli giusti, valutare se sono affidabili, e tenere tutto organizzato. Non dovrai più perdere tempo con richieste spam o partnership che non portano a nulla.\n\nGestisco anche un sistema di classificazione (tipo Bronze, Silver, Gold, Platinum) così puoi dare priorità alle collaborazioni più importanti. E tengo traccia di tutto, così hai sempre sott'occhio come stanno andando le cose.\n\nSe vuoi iniziare, usa /setup e ti mostro come configurare tutto. Sono letteralmente due minuti!`,

            bot_partnership_features: `Perfetto, ti spiego esattamente che tipo di partnership gestisco!\n\nInnanzitutto posso aiutarti a **creare partnership** con altri server Discord - tu mandi la richiesta con /partnership-request, io la processo, analizzo se è valida e la sottopongo allo staff per approvazione.\n\nPoi c'è la parte di **matchmaking automatico**: con /partner-match analizzo il tuo server (quanti membri hai, che tematica, che lingua) e ti trovo server compatibili. Tipo, se hai un server di gaming italiano cerco altri server gaming italiani della tua dimensione.\n\n**Gestisco i tier** delle partnership: Bronze, Silver, Gold, Platinum. Ogni tier ha vantaggi diversi tipo bonus XP. Lo staff può cambiare il tier con /partner-tier.\n\nC'è anche il **trust score system**: tengo traccia della tua affidabilità (parti da 50/100). Sale se completi partnership bene, scende se ci sono problemi. Serve per capire chi è un partner serio.\n\nInfine posso **monitorare** tutte le partnership attive con /partnership-list e /partnership-stats. Così vedi sempre come sta andando tutto.\n\nIn pratica gestisco l'intero ciclo: creazione → matchmaking → approvazione → classificazione → monitoraggio!`,

            partnership_approval: `Allora guarda, se vuoi che la tua richiesta venga accettata ci sono un paio di cose da tenere a mente.\n\nIntanto il server dovrebbe avere minimo 500 persone, ma non intendo 500 account morti - parlo di una community vera che chatta, partecipa, si diverte. Capita spesso che arrivino richieste da server con tanti membri ma completamente inattivi.\n\nQuando ti presenti fa la differenza essere chiari e professionali. Invece di "bel server entra" prova con: "Server italiano gaming competitivo, tornei ogni weekend, 800 membri attivi". Vedi che differenza?\n\nIl link di invito deve funzionare (sembra banale ma capita spesso!). E serve un trust score di almeno 40 punti - ma parti già da 50, quindi sei apposto.\n\nQuando sei pronto usa /partnership-request e riempi tutto con calma!`,

            partnership_reject: `Capisco che ricevere un rifiuto non sia piacevole, ma solitamente c'è un motivo specifico e si può sistemare.\n\nSpesso il problema è uno di questi: membri insufficienti o inattivi, descrizione troppo generica o poco chiara, link scaduto, oppure trust score sotto soglia. Se guardi la motivazione del rifiuto capisci subito cosa sistemare.\n\nLa cosa bella è che puoi riprovare dopo aver migliorato questi aspetti. Non è un no definitivo. Per esempio, se il problema era i membri, aspetta di arrivare a 500 attivi e riprova. Se era la descrizione, riscrivila in modo più professionale.\n\nSe pensi che il rifiuto sia stato un errore, puoi sempre usare /partnership-report per spiegare la situazione allo staff.`,

            create_partnership: `Creare una partnership è semplicissimo! Ti basta usare il comando /partnership-request e compilare i campi.\n\nEcco cosa ti chiederà: nome del tuo server, quanti membri avete, una descrizione di cosa offrite, il link di invito permanente, e una motivazione - tipo "Cerchiamo server gaming simili per organizzare tornei insieme".\n\nUn consiglio: prenditi qualche minuto per scrivere bene la descrizione. Non copiare-incollare qualcosa di generico. Spiega cosa rende il tuo server interessante, cosa fate di solito, che tipo di community siete. Questo aiuta moltissimo a trovare partnership compatibili.\n\nDopo che invii la richiesta, lo staff la valuta e se tutto è ok viene approvata. Di solito non ci vuole tanto!`,

            view_partnerships: `Per vedere le partnership attive usa /partnership-list. Ti mostra tutte quelle del server con i dettagli principali.\n\nSe vuoi i dettagli specifici di una partnership usa /partnership-view seguito dall'ID. Così vedi tutto: quando è stata creata, con chi, statistiche, tier, eccetera.\n\nC'è anche /partnership-stats se ti interessano i numeri globali - tipo quante partnership hai in totale, quali sono le più attive, come sta andando in generale.`,

            commands: `I comandi principali sono questi, te li spiego in modo pratico:\n\n/setup è quello da fare per primo - configura tutto il sistema. /partnership-request per chiedere nuove collaborazioni. /partnership-list per vedere quelle attive. /partner-match per trovare server compatibili.\n\nPoi ci sono quelli da staff: /partnership-approve e /partnership-reject per gestire le richieste. /partner-tier per cambiare il livello di una partnership.\n\nSe vuoi la lista completa basta che digiti / su Discord e scorri - ci sono circa 15-16 comandi in tutto. Alcuni sono per tutti, altri solo per gli admin.\n\nQuale ti interessa in particolare? Così te lo spiego meglio!`,

            setup_help: `/setup è il comando che devi usare per configurare tutto la prima volta. È molto semplice, ti fa scegliere tre cose:\n\nPrimo, il canale dove gestire le partnership - di solito si crea un canale tipo #partnership-logs. Secondo, il ruolo staff che può approvare/rifiutare (tipo @Moderatori o @Admin). Terzo, un canale per i log di sistema.\n\nUna volta fatto questo il bot è pronto. Ci vogliono letteralmente due minuti. Se sbagli qualcosa puoi sempre rifare /setup e riconfigurare.\n\nSe hai problemi con i permessi, assicurati che io abbia il ruolo Administrator o almeno i permessi per gestire canali e mandare messaggi.`,

            tier_system: `I tier funzionano tipo i punti fedeltà delle compagnie aeree - più sei attivo, più sali di livello.\n\nInizi Bronze (livello base, tutto funziona ma zero bonus). Poi c'è Silver che ti da +10% esperienza e un badge. Gold è +25% XP più un ruolo speciale. Platinum è il top: +50% XP e tutti i vantaggi.\n\nEsempio pratico: completi una partnership che normalmente da 100 punti. Se sei Bronze prendi 100, se sei Gold ne prendi 125, se sei Platinum ben 150. Capisci che conviene salire!\n\nPer gestire i tier usa /partner-tier. Li assegna lo staff in base all'importanza della partnership.`,

            trust_score: `Il trust score è la tua reputazione qui dentro. ${context.trustScore ? `Il tuo attualmente è ${context.trustScore}/100` : 'Parti da 50/100'}, che è un buon inizio.\n\nFunziona esattamente come eBay o Airbnb: ogni partnership completata bene ti da +10 punti. Se invece ci sono problemi, spam, accordi non rispettati, ne perdi tra 10 e 20.\n\nSopra 70 sei considerato partner premium e le tue richieste hanno priorità. Sotto 40 invece vengono controllate più attentamente. La soglia minima per richiedere partnership è appunto 40.\n\nLa cosa bella? Anche se scendi puoi sempre risalire completando partnership in modo serio. È meritocratico!`,

            server_improvement: `Far crescere un server richiede strategia, ma le partnership giuste accelerano tutto.\n\nCaso pratico: hai 300 membri, vuoi arrivare a 1000. Invece di spammare inviti random, trova 3-4 server con pubblico simile. Per dire, se hai un server di fotografi, cerca designer, artisti digitali, videomaker - gente con interessi compatibili.\n\nPoi organizza qualcosa insieme: contest, challenge, serate a tema. Quando entrambi i server ci guadagnano, la gente si muove, interagisce, invita amici.\n\nUsa /partner-match per trovare server compatibili in automatico. Ti fa risparmiare un sacco di tempo!\n\nRicorda: 10 partnership fatte bene valgono più di 100 buttate lì. Qualità batte quantità sempre.`,

            find_partners: `Per trovare partner compatibili la cosa migliore è usare /partner-match. Questo comando analizza il tuo server (tema, dimensione, lingua, tipo di community) e trova automaticamente server simili.\n\nAltrimenti puoi guardare in /partnership-list i server che hanno già partnership attive - spesso quelli sono della tua stessa nicchia e potrebbero interessarti.\n\nUn altro modo è partecipare alle community Discord sulla tua tematica e notare quali server sono attivi e professionali. Poi contattali tramite /partnership-request.\n\nL'importante è cercare compatibilità vera, non solo numeri. Un server con 200 membri super attivi vale più di uno con 2000 morti.`,

            troubleshooting: `Quando qualcosa non va, primo passo: /setup per controllare la configurazione. Verifica che canale partnership, ruolo staff e canale log siano impostati giusti.\n\nSecondo: permessi. Devo avere Administrator oppure almeno gestire canali + mandare messaggi + usare embed. Se do errori strani spesso è questione di permessi.\n\nTerzo: guarda il canale log. Scrivo lì tutti gli errori con dettagli. È tipo un diario dove segno tutto.\n\nSe continua a non andare usa /partnership-report e spiega cosa stavi facendo quando è successo. Tipo "stavo approvando una partnership e ha dato errore al click". Più dettagli = più facile capire!`,

            examples: `Ti faccio qualche esempio pratico di come funziona tutto:\n\nEsempio 1: Hai un server di gaming con 600 membri. Usi /partner-match e trova 3 server simili. Mandi /partnership-request al primo, compili tutto bene, viene approvato. Boom, partnership attiva! Organizzi un torneo insieme e entrambi i server crescono.\n\nEsempio 2: Ricevi una richiesta di partnership. Usi /partnership-view per vedere i dettagli. Il server sembra serio: 800 membri attivi, buona descrizione, trust score 65. Fai /partnership-approve e la partnership parte.\n\nEsempio 3: Una partnership non sta funzionando (membri inattivi, nessun evento). Usi /partnership-delete per chiuderla. Meglio chiudere quelle morte e cercarne di nuove.\n\nHai esempi specifici che ti interessano?`,

            ai_tech: `L'intelligenza artificiale che uso è stata sviluppata internamente da Flachi e tutto il suo team di sviluppo. Siamo ancora in una fase abbastanza iniziale - diciamo versione nativa, quindi ci stiamo lavorando costantemente per migliorarla.\n\nL'obiettivo è renderla sempre più utile per gestire le partnership e aiutarti con consigli specifici per il tuo server. Per ora funziona bene per rispondere a domande, dare suggerimenti, spiegare come funzionano i comandi, eccetera.\n\nSe noti che a volte le risposte potrebbero essere migliorate, è normale - è un lavoro in continua evoluzione! Flachi e il team aggiornano regolarmente il sistema.`,

            general: `Ciao! Sono qui per aiutarti con partnership e crescita del server.\n\nPuoi chiedermi cose tipo: "come faccio a creare una partnership?", "perché la mia richiesta è stata rifiutata?", "come trovo server compatibili?", "cosa significa il trust score?", o qualsiasi altra cosa ti venga in mente.\n\nPiù sei specifico nella domanda, più posso darti una risposta utile. Quindi invece di domande generiche, chiedi pure cose precise sulla tua situazione!\n\nCosa ti serve sapere?`
        };

        if (question.toLowerCase().includes('minfoai') || question.toLowerCase().includes('cosa fa') || question.toLowerCase().includes('cosa puo')) {
            return responses.bot_info;
        }

        return responses[category] || responses.general;
    }
}

module.exports = new ConversationalAI();
