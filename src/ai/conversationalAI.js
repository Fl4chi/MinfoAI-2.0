/**
 * Conversational AI Module - Solo risposte italiane pre-programmate
 */

const errorLogger = require('../utils/errorLogger');

class ConversationalAI {
    async askQuestion(question, context = {}) {
        try {
            const category = this.categorizeQuestion(question);
            return this.getFallbackResponse(question, context, category);
        } catch (error) {
            errorLogger.logError('ERROR', 'Errore conversational AI', 'CONV_AI_ERROR', error);
            return '🤖 Problema temporaneo. Riprova tra qualche secondo.';
        }
    }

    categorizeQuestion(question) {
        const q = question.toLowerCase();

        if (q.includes('minfoai') || q.includes('bot') || q.includes('cosa fa') || q.includes('cosa puo')) return 'bot_info';
        if (q.includes('approv') || q.includes('rifiut')) return 'partnership_approval';
        if (q.includes('tier')) return 'tier_system';
        if (q.includes('errore') || q.includes('problema')) return 'troubleshooting';
        if (q.includes('miglior') || q.includes('cresce')) return 'server_improvement';
        /**
         * Conversational AI Module - Solo risposte italiane pre-programmate
         */

        const errorLogger = require('../utils/errorLogger');

        class ConversationalAI {
            async askQuestion(question, context = {}) {
                try {
                    const category = this.categorizeQuestion(question);
                    return this.getFallbackResponse(question, context, category);
                } catch (error) {
                    errorLogger.logError('ERROR', 'Errore conversational AI', 'CONV_AI_ERROR', error);
                    return '🤖 Problema temporaneo. Riprova tra qualche secondo.';
                }
            }

            categorizeQuestion(question) {
                const q = question.toLowerCase();

                if (q.includes('minfoai') || q.includes('bot') || q.includes('cosa fa') || q.includes('cosa puo')) return 'bot_info';
                if (q.includes('approv') || q.includes('rifiut')) return 'partnership_approval';
                if (q.includes('tier')) return 'tier_system';
                if (q.includes('errore') || q.includes('problema')) return 'troubleshooting';
                if (q.includes('miglior') || q.includes('cresce')) return 'server_improvement';
                if (q.includes('trust') || q.includes('score')) return 'trust_score';

                return 'general';
            }

            getFallbackResponse(question, context, category) {
                const responses = {
                    bot_info: `Ciao! Sono qui per aiutarti a gestire le partnership del tuo server Discord. Pensa a me come quel amico esperto che ti da una mano quando devi trovare collaborazioni serie e far crescere la community.\n\nTi faccio un esempio: mettiamo che hai un server di gaming con 400 persone e vorresti collaborare con altri server simili. Io ti aiuto a trovare quelli giusti, valutare se sono affidabili, e tenere tutto organizzato. Non dovrai più perdere tempo con richieste spam o partnership che non portano a nulla.\n\nGestisco anche un sistema di classificazione (tipo Bronze, Silver, Gold, Platinum) così puoi dare priorità alle collaborazioni più importanti. E tengo traccia di tutto quello che succede, così hai sempre sott'occhio come stanno andando le cose.\n\nSe vuoi iniziare, ti basta un attimo: usa /setup e ti mostro come configurare tutto. Davvero, sono due minuti e sei pronto!`,

                    partnership_approval: `Allora guarda, se vuoi che la tua richiesta venga accettata ci sono un paio di cose da tenere a mente.\n\nIntanto il server dovrebbe avere minimo 500 persone, ma non intendo 500 account morti eh - parlo di una community vera che chatta, partecipa, si diverte. Capita spesso che arrivino richieste da server con tanti membri ma completamente inattivi, e quello non va bene.\n\nPoi quando ti presenti fa la differenza essere chiari e professionali. Tipo, invece che scrivere "bel server entra" prova con qualcosa tipo: "Server italiano dedicato al gaming competitivo, organizziamo tornei ogni weekend e abbiamo 800 membri attivi". Vedi la differenza? Così chi legge capisce subito cosa offri.\n\nAh, e il link di invito deve funzionare! Sembra banale ma ti giuro che un sacco di richieste arrivano con link scaduti o sbagliati.\n\nC'è poi il discorso del trust score: serve almeno 40 punti su 100. Buona notizia: parti già da 50, quindi sei a posto. Sale quando porti a termine partnership senza problemi, scende se ci sono casini. Praticamente funziona come il feedback di eBay,se ci pensi.\n\nQuando sei pronto usa /partnership-request, riempi tutto con calma e dovresti essere apposto!`,

                    tier_system: `Il sistema dei tier è tipo i livelli dei programmi fedeltà, hai presente quelli delle compagnie aeree o delle carte fedeltà?\n\nQuando inizi sei Bronze, che è il livello base. Va benissimo per cominciare, hai accesso a tutto quello che ti serve. Poi man mano che completi partnership e accumuli esperienza, sali di livello.\n\nAl Silver prendi un 10% in più di esperienza ogni volta che completi una partnership, più un badge carino da mostrare. Al Gold sono il 25% in più di XP e un ruolo speciale che tutti vedono. E al Platinum, che è il top, prendi il 50% di bonus su tutto.\n\nFacciamo un esempio pratico: diciamo che completi una partnership che normalmente ti darebbe 100 punti esperienza. Se sei Bronze prendi 100, se sei Gold ne prendi 125, se sei Platinum ben 150. Capisci che sale veloce!\n\nPer vedere a che punto sei usa /partner-tier. Così controlli quanto ti manca per salire e puoi farti un'idea di quando raggiungerai il prossimo livello.`,

                    server_improvement: `Far crescere un server richiede tempo e strategia, ma le partnership giuste possono davvero fare la differenza.\n\nPrendiamo un caso concreto: diciamo che hai 300 membri e punti ad arrivare a 1000. Invece di spammare inviti a casaccio su altri server (che non funziona mai), trova 3-4 server che hanno un pubblico simile al tuo. Per dire, se hai un server di fotografi, cerca community di designer, artisti digitali, videomaker.. persone con interessi compatibili insomma.\n\nPoi organizza qualcosa insieme: un contest fotografico, una serata di critique, una challenge settimanale. Quando le partnership sono fatte bene entrambi i server ci guadagnano, la gente si muove, interagisce, invita amici.\n\nC'è anche /partner-match che ti può aiutare a trovare server compatibili basandosi su tanti fattori diversi, tipo tema, dimensione, lingua, tipo di community. È comodo perché ti fa risparmiare un sacco di tempo.\n\nRicorda sempre: meglio 10 partnership fatte come si deve che 100 buttate là a caso. La qualità batte sempre la quantità, fidati.`,

                    troubleshooting: `Capisco che quando qualcosa non va può essere frustrante. Vediamo di sistemare insieme.\n\nPrimo passo: vai su /setup e controlla che sia tutto configurato per bene. Devi scegliere il canale dove gestire le partnership, il ruolo staff, ilcanale per i log.. se è saltato qualche passaggio è normale che poi ci siano problemi.\n\nUn'altra cosa importante: i permessi. Devo avere il ruolo Administrator, oppure almeno i permessi per gestire canali, mandare messaggi, usare gli embed. Se comincio a dare errori strani, magari è solo questione di permessi.\n\nC'è poi il canale log che se l'hai impostato scrive tutto quello che succede. Praticamente è come un diario dove segno ogni cosa - errori compresi. Se vai a guardare lì probabilmente trovi scritto esattamente cosa è andato storto.\n\nSe anche dopo questi controlli continua a non funzionare, usa /partnership-report e spiega bene cosa stavi facendo quando è successo il casino. Tipo "stavo approvando una partnership e mi ha dato errore quando ho premuto conferma". Più dettagli dai, più è facile capire il problema!`,

                    trust_score: `Il trust score è praticamente la tua reputazione qui dentro. ${context.trustScore ? `Il tuo al momento è ${context.trustScore} su 100` : 'Inizi da 50 su 100'}, che è un buon punto di partenza.\n\nFunziona esattamente come il rating dei venditori su eBay o le recensioni su Airbnb. Ogni volta che completi una partnership senza problemi guadagni 10 punti. Se invece ci sono casini, spam, accordi non rispettati, ne perdi tra 10 e 20 dipendendo da quanto è grave la cosa.\n\nQuesto punteggio conta parecchio per le collaborazioni future. Chi ha sopra 70 viene considerato partner affidabile premium e le sue richieste vengono guardate subito. Sotto 40 invece le richieste vengono controllate più attentamente prima di approvarle, è normale.\n\nLa cosa bella è che anche se scendi puoi sempre risalire. Basta portare a termine le partnership in modo professionale e il punteggio torna su. È meritocratico: premia chi si impegna e lavora bene nel tempo!`,

                    general: `Ciao! Sono qui per darti una mano con le partnership e la crescita del tuo server.\n\nPosso spiegarti come funzionano i vari comandi, darti consigli strategici su come trovare i partner giusti, aiutarti a capire perché magari una richiesta non è stata approvata, o semplicemente rispondere ai tuoi dubbi.\n\nLa cosa migliore è farmi domande specifiche. Tipo invece di "come funziona il bot" chiedimi "come posso trovare server compatibili col mio" oppure "perché il mio trust score è basso". Così posso darti risposte precise basate sulla tua situazione.\n\nAltrimenti dimmi un po', cosa ti serve sapere? Che dubbio hai?`
                };

                if (question.toLowerCase().includes('minfoai') || question.toLowerCase().includes('cosa fa') || question.toLowerCase().includes('cosa puo')) {
                    return responses.bot_info;
                }

                return responses[category] || responses.general;
            }
        }

        module.exports = new ConversationalAI();
