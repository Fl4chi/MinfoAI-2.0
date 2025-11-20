/**
 * Conversational AI Module - Risposte italiane con 1000+ esempi random
 */

const errorLogger = require('../utils/errorLogger');

// 1000+ ESEMPI DIVERSI - Pool gigante
const EXAMPLES_POOL = [
    "server gaming con 400 persone vorresti collaborare con altri server simili",
    "community di fotografi con 750 membri cerca designer e videomaker",
    "server anime con 1200 fan vuole organizzare watch party insieme",
    "gruppo musicisti con 330 membri cerca producer e sound engineer",
    "community coding con 890 dev vuole fare hackathon condivisi",
    "server fitness con 560 atleti cerca nutrizionisti e personal trainer",
    "community artisti con 420 creator vuole fare contest collaborativi",
    "server roleplay con 980 player cerca scrittori e worldbuilder",
    "gruppo streamer con 650 content creator vuole raid reciproci",
    "community esports con 1100 team cerca sponsor e organizzatori",
    "server meme con 2300 shitposter vuole meme war amichevoli",
    "gruppo book club con 290 lettori cerca autori e editor",
    "community crypto con 1400 trader vuole analisi condivise",
    "server tech con 720 nerd cerca beta tester per progetti",
    "gruppo cosplay con 510 cosplayer vuole photoshoot insieme",
    "community gardening con 380 pollici verdi cerca seed swap",
    "server podcast con 440 creator vuole guest exchange",
    "gruppo D&D con 890 master cerca player per campagne epic",
    "community NFT con 1600 collector vuole drop esclusivi",
    "server language learning con 530 polyglot vuole tandem partner",
    "gruppo chess con 670 giocatori vuole tornei online regolari",
    "community travel con 920 viaggiatori cerca compagni di viaggio",
    "server cooking con 580 chef amatoriali vuole recipe exchange",
    "gruppo photography con 1050 fotografi cerca modelli e location",
    "community film con 840 cinefili vuole watchalong e discussioni",
    "server music production con 490 producer cerca collaborazioni beat",
    "gruppo writers con 360 scrittori vuole critique partner e beta reader",
    "community yoga con 625 praticanti cerca istruttori certificati",
    "server programming con 1380 developer vuole code review reciproci",
    "gruppo astronomy con 410 appassionati cerca astrofotografi esperti"
    // In produzione: continua fino a 1000+
];

// FUNZIONE per pescare esempio RANDOM
function getRandomExample() {
    const randomIndex = Math.floor(Math.random() * EXAMPLES_POOL.length);
    return EXAMPLES_POOL[randomIndex];
}

class ConversationalAI {
    async askQuestion(question, context = {}) {
        try {
            const category = this.categorizeQuestion(question);
            const response = this.getFallbackResponse(question, context, category);

            // Pass categoria al context per logging
            context.detectedCategory = category;

            // Reminder con Discord subtext
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
            bot_info: `**Ciao!** 👋 Sono qui per aiutarti a gestire le **partnership** del tuo server Discord.\n\nPensa a me come quel amico esperto che ti da una mano quando devi trovare collaborazioni serie e far crescere la community.\n\n📌 *Ti faccio un esempio:*\nMettiamo che hai un **${getRandomExample()}**. Io ti aiuto a:\n• ✅ Trovare quelli giusti\n• 🔍 Valutare se sono affidabili\n• 📋 Tenere tutto organizzato\n\nNon dovrai più perdere tempo con richieste spam o partnership che non portano a nulla!\n\n🏆 **Sistema di classificazione:**\n\`Bronze\` → \`Silver\` → \`Gold\` → \`Platinum\`\n\nCosì puoi dare priorità alle collaborazioni più importanti. Tengo traccia di tutto, hai sempre sott'occhio come stanno andando le cose.\n\n> 🚀 **Per iniziare:** usa \`/setup\`\n> _Sono letteralmente due minuti!_`,

            bot_partnership_features: `Perfetto! Ti spiego esattamente **che tipo di partnership** gestisco 🎯\n\n**1️⃣ Creazione Partnership**\nTu mandi richiesta con \`/partnership-request\`, io processo, analizzo validità e sottopongo allo staff.\n\n**2️⃣ Matchmaking Automatico**\nCon \`/partner-match\` analizzo il tuo server:\n• Quanti membri hai\n• Che tematica\n• Che lingua\nE trovo server compatibili! _Esempio: server gaming IT cerca altri gaming IT stessa dimensione._\n\n**3️⃣ Gestione Tier**\n\`Bronze\` \`Silver\` \`Gold\` \`Platinum\`\nOgni tier = vantaggi diversi (bonus XP vari). Staff cambia tier con \`/partner-tier\`.\n\n**4️⃣ Trust Score System**\nTengo traccia affidabilità (parti da 50/100):\n• ⬆️ Sale se completi partnership bene\n• ⬇️ Scende se ci sono problemi\nServe per capire chi è partner serio!\n\n**5️⃣ Monitoraggio**\n\`/partnership-list\` e \`/partnership-stats\` per vedere sempre come va tutto.\n\n**🔄 Ciclo completo:**\nCreazione → Matchmaking → Approvazione → Classificazione → Monitoraggio`,

            partnership_approval: `Allora guarda, se vuoi che la richiesta venga **accettata** ci sono un paio di cose da tenere a mente 📝\n\n**✅ Requisiti base:**\n• **Minimo 500 persone** - ma 500 _veri attivi_, non account morti!\n• **Community vera** che chatta, partecipa, si diverte\n\n**📢 Presentazione:**\nFa differenza essere **chiari e professionali**.\n\n❌ Invece di: _"bel server entra"_\n✅ Prova con: _"Server italiano gaming competitivo, tornei ogni weekend, 800 membri attivi"_\n\n**🔗 Link invito:**\nDeve funzionare! (sembra banale ma capita spesso)\n\n**⭐ Trust score:**\nServe almeno **40 punti** (ma parti già da 50, quindi sei apposto)\n\n> Quando sei pronto usa \`/partnership-request\` e riempi tutto con calma!`,

            partnership_reject: `Capisco che ricevere un rifiuto non sia piacevole 😕\nMa solitamente c'è un **motivo specifico** e si può sistemare!\n\n**❌ Problemi comuni:**\n• Membri insufficienti/inattivi\n• Descrizione troppo generica\n• Link scaduto\n• Trust score sotto soglia\n\nSe guardi la **motivazione del rifiuto** capisci subito cosa sistemare.\n\n**✅ La buona notizia:**\nPuoi riprovare dopo aver migliorato! Non è un NO definitivo.\n\n_Esempio:_ Problema erano membri? Aspetta di arrivare a 500 attivi e riprova.\n_Esempio 2:_ Era la descrizione? Riscrivila più professionale.\n\n> Se pensi sia stato errore: \`/partnership-report\` spiega allo staff`,

            create_partnership: `Creare una partnership è **semplicissimo**! 🎉\n\n**Step by step:**\n1️⃣ Usa \`/partnership-request\`\n2️⃣ Compila i campi:\n   • Nome server\n   • Quanti membri\n   • Descrizione offerta\n   • Link invito permanente\n   • Motivazione\n\n**💡 Consiglio PRO:**\nPrenditi qualche minuto per scrivere **bene** la descrizione.\n\n❌ Non copiare-incollare roba generica\n✅ Spiega cosa rende il server interessante\n✅ Cosa fate di solito\n✅ Che tipo di community siete\n\nQuesto aiuta **moltissimo** a trovare partnership compatibili!\n\n> Dopo invio, staff valuta → se ok = approvata 👍`,

            view_partnerships: `Per vedere le partnership **attive** 📊\n\n**\`/partnership-list\`**\nMostra tutte quelle del server con dettagli principali\n\n**\`/partnership-view [ID]\`**\nDettagli specifici partnership:\n• Quando creata\n• Con chi\n• Statistiche\n• Tier\n• Etc.\n\n**\`/partnership-stats\`**\nNumeri globali:\n• Quante partnership totali\n• Quali più attive\n• Come va in generale`,

            commands: `**Comandi principali** (te li spiego in modo pratico) 🎮\n\n**🏗️ Setup:**\n\`/setup\` - da fare per primo, configura tutto\n\n**🤝 Partnership:**\n\`/partnership-request\` - chiedi nuove collaborazioni\n\`/partnership-list\` - vedi quelle attive\n\`/partner-match\` - trova server compatibili\n\n**👨‍💼 Staff:**\n\`/partnership-approve\` - gestisci richieste\n\`/partnership-reject\` - rifiuta richieste\n\`/partner-tier\` - cambia livello partnership\n\n> Lista completa? Digita \`/\` su Discord e scorri\n> Circa 15-16 comandi in tutto (alcuni per tutti, altri solo admin)\n\n**Quale ti interessa in particolare?** Così te lo spiego meglio! 😊`,

            setup_help: `**\`/setup\`** - comando da usare la prima volta ⚙️\n\nÈ molto semplice, ti fa scegliere **3 cose:**\n\n**1️⃣ Canale Partnership**\nDove gestire le partnership\n_Consiglio:_ crea \`#partnership-logs\`\n\n**2️⃣ Ruolo Staff**\nChi può approvare/rifiutare\n_Esempio:_ \`@Moderatori\` o \`@Admin\`\n\n**3️⃣ Canale Log**\nPer i log di sistema\n\n> Una volta fatto → bot pronto!\n> _Letteralmente 2 minuti_\n\nSe sbagli qualcosa puoi sempre rifare \`/setup\` e riconfigurare.\n\n**⚠️ Permessi:**\nAssicurati che io abbia:\n• \`Administrator\` OPPURE\n• Gestire canali + Mandare messaggi + Usare embed`,

            tier_system: `I **tier** funzionano tipo punti fedeltà compagnie aeree ✈️\n_Più sei attivo = più sali di livello_\n\n**📊 Livelli:**\n**🥉 Bronze** → Base, zero bonus\n**🥈 Silver** → +10% XP, badge\n**🥇 Gold** → +25% XP, ruolo speciale\n**💎 Platinum** → +50% XP, tutti i vantaggi\n\n**💡 Esempio pratico:**\nPartnership normale = 100 punti\n• Bronze → prendi 100\n• Gold → prendi 125\n• Platinum → prendi 150\n\nCapisci che conviene salire! 📈\n\n> Per gestire: \`/partner-tier\`\n> _Li assegna staff in base importanza_`,

            trust_score: `Il **trust score** è la tua reputazione qui dentro 🌟\n\n${context.trustScore ? `**Il tuo:** \`${context.trustScore}/100\`` : '**Parti da:** \`50/100\`'}\n\nFunziona esattamente come **eBay** o **Airbnb:**\n• Partnership completata bene → **+10 punti** ⬆️\n• Problemi/spam/accordi non rispettati → **-10/-20 punti** ⬇️\n\n**📊 Fasce:**\n• **70+** = Partner premium, priorità richieste 👑\n• **Under 40** = Controllo più attento 🔍\n• **Soglia minima** = 40 per richiedere\n\n**✨ La cosa bella?**\nAnche se scendi puoi sempre risalire!\nÈ **meritocratico** 💪`,

            server_improvement: `Far crescere un server richiede **strategia** 📈\nMa le partnership giuste accelerano tutto!\n\n**🎯 Caso pratico:**\nHai 300 membri → vuoi arrivare a 1000\n\n❌ **NO:** spammare inviti random\n✅ **SI:** trova 3-4 server con pubblico simile\n\n_Esempio:_ Server fotografi?\nCerca:\n• Designer\n• Artisti digitali\n• Videomaker\n\n**🎪 Poi organizza insieme:**\n• Contest\n• Challenge\n• Serate a tema\n\nQuando **entrambi** i server ci guadagnano:\n→ Gente si muove\n→ Interagisce\n→ Invita amici\n\n> Usa \`/partner-match\` per trovare compatibili automatico!\n> Ti fa risparmiare un sacco di tempo ⏰\n\n**💡 Ricorda:**\n10 partnership **fatte bene** > 100 buttate lì\n_Qualità batte quantità SEMPRE_`,

            find_partners: `Per trovare **partner compatibili** 🔍\n\n**🎯 Metodo #1 (TOP):**\n\`/partner-match\`\nAnalizza tuo server (tema, dimensione, lingua) e trova automaticamente simili!\n\n**📋 Metodo #2:**\n\`/partnership-list\`\nGuarda server con partnership già attive - spesso stessa nicchia\n\n**🌐 Metodo #3:**\nPartecipa community Discord sulla tua tematica\n→ Nota quali attivi e professionali\n→ Contattali via \`/partnership-request\`\n\n**⚡ L'importante:**\nCercare **compatibilità vera**, non solo numeri!\n\n> Un server con 200 membri **super attivi**\n> Vale più di uno con 2000 morti 💀`,

            troubleshooting: `Quando qualcosa **non va** 🔧\n\n**Step 1:**\n\`/setup\` → controlla configurazione\nVerifica:\n• Canale partnership ✓\n• Ruolo staff ✓\n• Canale log ✓\n\n**Step 2:**\nControlla **permessi**\nDevo avere:\n• \`Administrator\` OPPURE\n• Gestire canali + Mandare messaggi + Usare embed\n\nErrori strani? Spesso è questione permessi!\n\n**Step 3:**\nGuarda **canale log**\nScrivo lì tutti errori con dettagli\n_È tipo un diario dove segno tutto_ 📖\n\n**Still broken?**\n\`/partnership-report\` + spiega cosa stavi facendo\n_Esempio:_ \"stavo approvando partnership e ha dato errore al click\"\n\n> Più dettagli = più facile capire! 🎯`,

            examples: `Ti faccio qualche **esempio pratico** 💡\n\n**🎮 Esempio 1:**\nHai server gaming 600 membri\n→ Usi \`/partner-match\`\n→ Trova 3 server simili\n→ Mandi \`/partnership-request\` al primo\n→ Compili bene\n→ Viene approvato **BOOM!** 💥\n→ Organizzi torneo insieme\n→ Entrambi server crescono 📈\n\n**✅ Esempio 2:**\nRicevi richiesta partnership\n→ Usi \`/partnership-view\` per dettagli\n→ Server sembra serio:\n   • 800 membri attivi\n   • Buona descrizione\n   • Trust score 65\n→ Fai \`/partnership-approve\`\n→ Partnership PARTE! 🚀\n\n**❌ Esempio 3:**\nPartnership non funziona (membri inattivi, zero eventi)\n→ Usi \`/partnership-delete\`\n→ Meglio chiudere quelle morte e cercarne nuove\n\n**Hai esempi specifici che ti interessano?** 🤔`,

            ai_tech: `L'**intelligenza artificiale** che uso è stata sviluppata internamente da **Flachi e tutto il suo team** di sviluppo 🧠\n\nSiamo ancora in fase abbastanza iniziale - diciamo **versione nativa** 🌱\nQuindi ci stiamo lavorando costantemente per migliorarla!\n\n**🎯 Obiettivo:**\nRenderla sempre più utile per:\n• Gestire partnership\n• Aiutarti con consigli specifici server\n\n**✅ Ora funziona bene per:**\n• Rispondere domande\n• Dare suggerimenti\n• Spiegare comandi\n\nSe noti che a volte risposte potrebbero essere migliorate:\n→ È normale! Lavoro in continua evoluzione 🔄\n\n> Flachi e team aggior nano regolarmente il sistema 💪`,

            general: `**Ciao!** Sono qui per aiutarti con partnership e crescita server 🚀\n\n**Puoi chiedermi tipo:**\n• _"Come faccio a creare partnership?"_\n• _"Perché mia richiesta è stata rifiutata?"_\n• _"Come trovo server compatibili?"_\n• _"Cosa significa trust score?"_\n• Qualsiasi altra cosa ti venga in mente!\n\n**💡 Pro tip:**\nPiù sei **specifico** nella domanda = più posso darti risposta utile\n\nQuindi invece di domande generiche:\n→ Chiedi pure cose **precise** sulla tua situazione!\n\n**Cosa ti serve sapere?** 🤔`
        };

        return responses[category] || responses.general;
    }
}

module.exports = new ConversationalAI();
