/**
 * Conversational AI Module - Risposte italiane naturali e specifiche
 */

const errorLogger = require('../utils/errorLogger');

class ConversationalAI {
    categorizeQuestion(question) {
        const q = question.toLowerCase();

        //Domande specifiche sul bot
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
