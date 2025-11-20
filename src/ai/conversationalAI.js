/**
 * Conversational AI Module - Risposte italiane naturali
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
    "server roleplay medievale con lore dettagliata e eventi narrativi settimanali",
    "community crypto/trading con analisi di mercato e segnali condivisi",
    "server podcast dove creator si scambiano ospiti per episodi cross-promotion",
    "gruppo book club che legge un libro al mese e organizza discussioni live",
    "community cosplay con tutorial, photoshoot organizzati e contest mensili",
    "server tech dove si discute di programmazione, AI e nuove tecnologie",
    "gruppo streaming con raid reciproci e collaborazioni tra content creator",
    "community D&D con 15+ campagne attive e master esperti",
    "server cooking dove chef amatoriali condividonricette famiglia e segreti cucina",
    "gruppo language exchange con madrelingua che insegnano lingue gratuitamente",
    "community gardening urbano con consigli su piante da appartamento",
    "server meme italiano con contest settimanali e premi per i migliori shitpost",
    "gruppo travel blogger che condivide itinerari nascosti e consigli viaggio",
    "community chess con tornei blitz giornalieri e lezioni da maestri FIDE",
    "server minecraft con vanilla survival e progetti collaborativi giganti",
    "gruppo yoga e mindfulness con sessioni guidate mattutine via voice",
    "community NFT art dove artisti emergenti mostrano collezioni",
    "server valorant con team ranked che cerca sparring partner stesso elo",
    "gruppo writing dove scrittori si scambiano feedback su racconti e romanzi",
    "community pets dove owner condividono foto, consigli veterinari e storie",
    "server league of legends con coaching gratuito per bronze-gold player",
    "gruppo investing con portfolio review e strategie long-term",
    "community film dove cinefili discutono uscite, cult movie e directors",
    "server fortnite con creative maps custom e private lobby per eventi",
    "gruppo running con tracker Strava integrato e sfide mensili",
    "community science dove si discutono paper, scoperte e esperimenti",
    "server among us con lobby private, regole custom e tornei",
    "gruppo skincare con routine personalizzate e product review onesti",
    "community woodworking dove artigiani mostrano progetti e tecniche",
    "server apex legends con team per ranked split e ALGS viewing party",
    "gruppo meditation con sessioni zen guidate e discussion su mindfulness",
    "community car enthusiast con meet organizzati e talk su tuning",
    "server CS:GO con retake server e aim training routines condivise",
    "gruppo vegan con ricette creative, meal prep tips e supporto community",
    "server dota 2 con party stack per ranked e coaching da immortal player",
    "gruppo cocktail enthusiast dove bartender condividono ricette signature",
    "community aquascaping con setup tank, breeding tips e plant swap",
    "server overwatch con VOD review e custom scrim per miglioramento",
    "gruppo keto diet con macro tracking, ricette e success stories motivanti",
    "community reptile keeper con breeding projects e care sheets dettagliati",
    "server rocket league con replay analysis e rotazione drill practice",
    "gruppo powerlifting con form check video e programmi allenamento",
    "community bird watching con photo sharing e species identification help"
];

function getRandomExample() {
    return EXAMPLES_POOL[Math.floor(Math.random() * EXAMPLES_POOL.length)];
}

class ConversationalAI {
    async askQuestion(question, context = {}) {
        try {
            const category = this.categorizeQuestion(question);
            const response = this.getFallbackResponse(question, context, category);

            context.detectedCategory = category;

            return response + '\n\n-# 💬 Usa `/ai-help` per continuare a chattare con me!';
        } catch (error) {
            console.error('[conversationalAI] Error:', error.message);
            errorLogger.logError('ERROR', 'Errore conversational AI', 'CONV_AI_ERROR', error);
            return 'Mi dispiace, c\'è stato un problemino tecnico. Riprova tra un attimo!\n\n-# 💬 Usa `/ai-help` per fare altre domande!';
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
        const responses = {
            bot_info: `**Ciao!** Sono qui per aiutarti a gestire le **partnership** del tuo server Discord.\n\nPensa a me come quel amico esperto che ti da una mano quando devi trovare collaborazioni serie e far crescere la community.\n\n**Ti faccio un esempio pratico:**\nMettiamo che hai un ${getRandomExample()}. Io ti aiuto a trovare quelli giusti, valutare se sono affidabili, e tenere tutto organizzato.\n\nNon dovrai più perdere tempo con richieste spam o partnership che non portano a nulla.\n\n**Sistema di classificazione:**\n\`Bronze\` → \`Silver\` → \`Gold\` → \`Platinum\`\n\nCosì puoi dare priorità alle collaborazioni più importanti. Tengo traccia di tutto, hai sempre sott'occhio come stanno andando le cose.\n\n→ Per iniziare usa \`/setup\` (sono letteralmente due minuti)`,

            bot_partnership_features: `Perfetto! Ti spiego esattamente **che tipo di partnership** gestisco.\n\n**Creazione Partnership**\nTu mandi richiesta con \`/partnership-request\`, io processo, analizzo validità e sottopongo allo staff per approvazione.\n\n**Matchmaking Automatico**\nCon \`/partner-match\` analizzo il tuo server (quanti membri, che tematica, che lingua) e trovo server compatibili.\nEsempio: se hai server gaming italiano cerco altri gaming italiani della tua dimensione.\n\n**Gestione Tier**\n\`Bronze\` \`Silver\` \`Gold\` \`Platinum\` - ogni tier ha vantaggi diversi (bonus XP). Lo staff cambia tier con \`/partner-tier\`.\n\n**Trust Score System**\nTengo traccia della tua affidabilità (parti da 50/100). Sale se completi partnership bene, scende se ci sono problemi. Serve per capire chi è un partner serio.\n\n**Monitoraggio Completo**\n\`/partnership-list\` e \`/partnership-stats\` per vedere sempre come sta andando tutto.\n\nIn pratica gestisco l'intero ciclo: creazione → matchmaking → approvazione → classificazione → monitoraggio`,

            partnership_approval: `Se vuoi che la richiesta venga **accettata**, ci sono alcune cose da tenere a mente.\n\n**Requisiti base:**\n• Minimo **500 persone** - ma 500 veri attivi, non account morti\n• Community vera che chatta, partecipa, si diverte\n\n**Presentazione professionale:**\n❌ "bel server entra"\n✅ "Server italiano gaming competitivo, tornei ogni weekend, 800 membri attivi"\n\nVedi la differenza?\n\n**Altri requisiti:**\n• Link invito deve funzionare\n• Trust score minimo 40 punti (ma parti già da 50)\n\nQuando sei pronto usa \`/partnership-request\` e compila tutto con calma.`,

            partnership_reject: `Capisco che ricevere un rifiuto non sia piacevole, ma solitamente c'è un motivo specifico e si può sistemare.\n\n**Problemi comuni:**\n• Membri insufficienti o inattivi\n• Descrizione troppo generica\n• Link scaduto\n• Trust score sotto soglia\n\nGuarda la motivazione del rifiuto per capire cosa sistemare.\n\n**La buona notizia:** puoi riprovare dopo aver migliorato questi aspetti. Non è un NO definitivo.\n\nEsempio: problema erano i membri? Aspetta di arrivare a 500 attivi e riprova.\n\nSe pensi sia stato un errore, usa \`/partnership-report\` per spiegare la situazione allo staff.`,

            create_partnership: `Creare una partnership è semplicissimo!\n\n**Step by step:**\n1. Usa \`/partnership-request\`\n2. Compila i campi: nome server, quanti membri, descrizione, link invito, motivazione\n\n**Consiglio importante:**\nPrenditi qualche minuto per scrivere **bene** la descrizione. Non copiare-incollare roba generica.\n\nSpiega:\n• Cosa rende il server interessante\n• Cosa fate di solito\n• Che tipo di community siete\n\nQuesto aiuta moltissimo a trovare partnership compatibili.\n\nDopo l'invio, lo staff valuta e se tutto è ok viene approvata.`,

            view_partnerships: `Per vedere le partnership attive:\n\n**\`/partnership-list\`** - mostra tutte quelle del server con dettagli principali\n\n**\`/partnership-view [ID]\`** - dettagli specifici: quando creata, con chi, statistiche, tier, etc.\n\n**\`/partnership-stats\`** - numeri globali: quante in totale, quali più attive, andamento generale`,

            commands: `**Comandi principali:**\n\n**Setup**\n\`/setup\` - configura tutto (da fare per primo)\n\n**Partnership**\n\`/partnership-request\` - richiedi nuove collaborazioni\n\`/partnership-list\` - vedi quelle attive\n\`/partner-match\` - trova server compatibili\n\n**Staff**\n\`/partnership-approve\` - approva richieste\n\`/partnership-reject\` - rifiuta richieste\n\`/partner-tier\` - cambia livello partnership\n\nPer la lista completa digita \`/\` su Discord e scorri. Ci sono circa 15-16 comandi (alcuni per tutti, altri solo admin).\n\nQuale ti interessa in particolare?`,

            setup_help: `**\`/setup\`** è il comando da usare la prima volta.\n\nTi fa scegliere 3 cose:\n\n**1. Canale Partnership** - dove gestire le partnership (consiglio: crea \`#partnership-logs\`)\n**2. Ruolo Staff** - chi può approvare/rifiutare (es: \`@Moderatori\` o \`@Admin\`)\n**3. Canale Log** - per i log di sistema\n\nUna volta fatto, il bot è pronto. Letteralmente 2 minuti.\n\nSe sbagli qualcosa puoi sempre rifare \`/setup\` e riconfigurare.\n\n**Permessi necessari:**\nAssicurati che il bot abbia \`Administrator\` OPPURE almeno: gestire canali + mandare messaggi + usare embed.`,

            tier_system: `I **tier** funzionano tipo punti fedeltà delle compagnie aeree - più sei attivo, più sali.\n\n**Livelli:**\n🥉 **Bronze** - livello base, zero bonus\n🥈 **Silver** - +10% XP, badge\n🥇 **Gold** - +25% XP, ruolo speciale  \n💎 **Platinum** - +50% XP, tutti i vantaggi\n\n**Esempio pratico:**\nPartnership normale = 100 punti\n• Bronze → prendi 100\n• Gold → prendi 125\n• Platinum → prendi 150\n\nPer gestire i tier usa \`/partner-tier\`. Li assegna lo staff in base all'importanza della partnership.`,

            trust_score: `Il **trust score** è la tua reputazione qui dentro.\n\n${context.trustScore ? `Il tuo: \`${context.trustScore}/100\`` : 'Parti da: \`50/100\`'}\n\nFunziona come eBay o Airbnb:\n• Partnership completata bene → **+10 punti**\n• Problemi, spam, accordi non rispettati → **-10/-20 punti**\n\n**Fasce:**\n• **70+** = Partner premium, priorità richieste\n• **Under 40** = Controllo più attento\n• **Soglia minima** = 40 per richiedere partnership\n\nAnche se scendi puoi sempre risalire completando partnership in modo serio. È meritocratico.`,

            server_improvement: `Far crescere un server richiede strategia, ma le partnership giuste accelerano tutto.\n\n**Caso pratico:**\nHai 300 membri, vuoi arrivare a 1000.\n\n❌ **NO:** spammare inviti random\n✅ **SI:** trova 3-4 server con pubblico simile\n\nEsempio: hai server fotografi? Cerca designer, artisti digitali, videomaker - gente con interessi compatibili.\n\n**Poi organizza insieme:**\n• Contest\n• Challenge\n• Serate a tema\n\nQuando entrambi i server ci guadagnano, la gente si muove, interagisce, invita amici.\n\nUsa \`/partner-match\` per trovare compatibili in automatico.\n\n**Ricorda:** 10 partnership fatte bene > 100 buttate lì. Qualità batte quantità sempre.`,

            find_partners: `Per trovare partner compatibili:\n\n**Metodo #1 (migliore):**\n\`/partner-match\` - analizza il tuo server (tema, dimensione, lingua) e trova automaticamente simili\n\n**Metodo #2:**\n\`/partnership-list\` - guarda server con partnership già attive, spesso sono della tua stessa nicchia\n\n**Metodo #3:**\nPartecipa a community Discord sulla tua tematica, nota quali sono attivi e professionali, poi contattali via \`/partnership-request\`\n\n**L'importante:** cercare compatibilità vera, non solo numeri. Un server con 200 membri super attivi vale più di uno con 2000 morti.`,

            troubleshooting: `Quando qualcosa non va:\n\n**Step 1** - \`/setup\` per controllare configurazione\nVerifica: canale partnership, ruolo staff, canale log\n\n**Step 2** - Controlla permessi\nIl bot deve avere \`Administrator\` OPPURE almeno: gestire canali + mandare messaggi + usare embed\n\n**Step 3** - Guarda canale log\nScrivo lì tutti gli errori con dettagli. È tipo un diario dove segno tutto.\n\n**Ancora problemi?**\n\`/partnership-report\` e spiega cosa stavi facendo. Esempio: "stavo approvando partnership e ha dato errore al click". Più dettagli = più facile capire.`,

            examples: `**Esempio pratico #1:**\nHai server gaming 600 membri → usi \`/partner-match\` → trova 3 simili → mandi \`/partnership-request\` → viene approvato → organizzi torneo insieme → entrambi crescono\n\n**Esempio #2:**\nRicevi richiesta partnership → usi \`/partnership-view\` → server sembra serio (800 membri attivi, buona descrizione, trust score 65) → fai \`/partnership-approve\` → partnership parte\n\n**Esempio #3:**\nPartnership non funziona (membri inattivi, zero eventi) → usi \`/partnership-delete\` → meglio chiudere quelle morte e cercarne nuove\n\nHai esempi specifici che ti interessano?`,

            ai_tech: `L'intelligenza artificiale che uso è stata sviluppata internamente da **Flachi e il suo team** di sviluppo.\n\nSiamo ancora in fase iniziale (versione nativa), quindi ci stiamo lavorando costantemente per migliorarla.\n\n**Obiettivo:** renderla sempre più utile per gestire partnership e dare consigli specifici per il tuo server.\n\n**Ora funziona bene per:** rispondere domande, dare suggerimenti, spiegare comandi.\n\nSe noti che a volte le risposte potrebbero essere migliorate, è normale - è un lavoro in continua evoluzione. Flachi e il team aggiornano regolarmente il sistema.`,

            general: `Ciao! Sono qui per aiutarti con partnership e crescita del server.\n\nPuoi chiedermi cose tipo:\n• "Come faccio a creare una partnership?"\n• "Perché la mia richiesta è stata rifiutata?"\n• "Come trovo server compatibili?"\n• "Cosa significa il trust score?"\n• Qualsiasi altra cosa ti venga in mente\n\n**Pro tip:** più sei specifico nella domanda, più posso darti una risposta utile.\n\nQuindi invece di domande generiche, chiedi pure cose precise sulla tua situazione.\n\nCosa ti serve sapere?`
        };

        return responses[category] || responses.general;
    }
}

module.exports = new ConversationalAI();
