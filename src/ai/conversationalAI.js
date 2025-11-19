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
            bot_info: `🤖 Ciao! Sono MinfoAI, il tuo assistente personale per gestire le partnership Discord in modo professionale.\n\nImmagina di avere un manager dedicato che ti aiuta a trovare, approvare e gestire collaborazioni con altri server. Per esempio, se amministri un server gaming e vuoi espandere la tua community, io ti aiuto a trovare partner affidabili, analizzare le loro credenziali e mantenere tutto organizzato.\n\nGestisco un sistema completo con 4 tier (Bronze, Silver, Gold, Platinum) che ti permette di classificare le partnership in base alla loro importanza. Inoltre tengo traccia di tutto con analytics dettagliate e un trust score che misura l'affidabilità di ogni collaborazione.\n\nPer iniziare, usa il comando /setup e ti guiderò nella configurazione! È semplicissimo.`,

            partnership_approval: `📋 Allora, per avere maggiori probabilità che una partnership venga approvata, ci sono alcuni aspetti fondamentali da considerare.\n\nPrima di tutto, il tuo server dovrebbe avere almeno 500 membri attivi. Non si tratta solo di numeri: cerchiamo server con una community vera, non bot o membri fantasma.\n\nPoi è importante come ti presenti: una descrizione chiara e professionale fa la differenza. Per esempio, invece di scrivere "server figo unisciti", spiega cosa offri: "Community italiana di gaming con tornei settimanali e 800 membri attivi".\n\nIl link di invito deve essere permanente e funzionante. So che sembra ovvio, ma ti stupirai di quante richieste arrivano con link scaduti!\n\nInfine, il trust score minimo richiesto è 40 su 100. Questo punteggio aumenta col tempo se completi partnership con successo e diminuisce se ci sono problemi. Parti da 50, quindi sei già a buon punto!\n\nQuando sei pronto, usa /partnership-request e compila tutti i campi con attenzione.`,

            tier_system: `⭐ Il sistema tier funziona un po' come i programmi fedeltà che conosci, tipo quelli delle compagnie aeree.\n\nQuando inizi, parti dal tier Bronze. È il livello base, senza bonus particolari, ma ti permette di accedere a tutte le funzionalità principali.\n\nMano a mano che completi partnership con successo e accumuli esperienza, puoi salire al Silver (che ti dà un boost del 10% sull'XP guadagnata e un badge esclusivo), poi al Gold (25% XP e un ruolo speciale visibile nel server) e infine al prestigioso Platinum (50% XP e tutti i vantaggi disponibili).\n\nPer esempio, se sei Gold e completi una partnership che normalmente ti darebbe 100 XP, ne ricevi invece 125. Questo ti aiuta a crescere più velocemente e ad accedere a partnership più esclusive.\n\nPuoi gestire e aggiornare il tuo tier con il comando /partner-tier. Controlla regolarmente per vedere quanto ti manca al prossimo livello!`,

            server_improvement: `💡 Far crescere un server Discord in modo organico richiede strategia e costanza, ma con le partnership giuste puoi accelerare molto il processo.\n\nPensiamoci: hai un server con 300 membri e vuoi arrivare a 1000. Invece di spammare inviti a caso, trova 3-4 server simili al tuo (stesso tema, stessa lingua, pubblico compatibile) e proponi una partnership strategica. Per esempio, se hai un server di fotografia, cerca altri server creativi - magari di design grafico o videomaking.\n\nOrganizza eventi congiunti: un torneo, un contest, una serata a tema. Quando fai partnership con MinfoAI, puoi usare la funzione /partner-match che analizza automaticamente quali server sono più compatibili con il tuo basandosi su numerosi fattori.\n\nMantieni la community attiva con contenuti originali. Non basta copiare meme da altri server - crea qualcosa di unico che dia alle persone un motivo per restare e invitare amici.\n\nRicorda: 10 partnership fatte bene valgono più di 100 fatte male. Qualità over quantità, sempre!`,

            troubleshooting: `🔧 Capisco che possa essere frustrante quando qualcosa non funziona. Vediamo di risolvere insieme.\n\nLa prima cosa da fare è verificare la configurazione base con /setup. Questo comando ti guida step-by-step nella configurazione del canale partnership, ruolo staff e canale log. Se hai saltato qualche passaggio, è normale che ci siano problemi.\n\nUn altro aspetto cruciale sono i permessi: io ho bisogno del ruolo Administrator oppure almeno dei permessi per gestire canali, mandare messaggi e usare embed. Se sto dando errori strani, controlla che io abbia questi permessi.\n\nC'è anche un log canale che tiene traccia di tutti gli errori. Se l'hai configurato, guarda lì per dettagli specifici su cosa stia andando storto. È come un diario dove annoto tutto quello che succede.\n\nSe dopo questi controlli il problema persiste, usa /partnership-report per segnalarlo allo staff. Descrivi esattamente cosa stavi facendo quando è successo - aiuta moltissimo nella diagnosi!`,

            trust_score: `🛡️ Il trust score è fondamentalmente la tua "reputazione" nel sistema. ${context.trustScore ? `Al momento il tuo è ${context.trustScore} su 100` : 'Parti da 50 su 100'}, che è un punto di partenza solido.\n\nPensa al trust score come al rating di un venditore su eBay o Airbnb. Più sei affidabile e completi partnership con successo, più sale. Per esempio, ogni volta che porti a termine una partnership senza problemi, guadagni +10 punti.\n\nPurtroppo funziona anche al contrario: se ci sono violazioni degli accordi, spam, o comportamenti scorretti, perdi tra 10 e 20 punti a seconda della gravità. Per questo è importante mantenere sempre un approccio professionale.\n\nIl trust score influenza molto le tue collaborazioni future. Server con score alto (sopra 70) vengono considerati partner premium e hanno priorità nelle approvazioni. Sotto 40, invece, le richieste vengono esaminate più attentamente.\n\nIl bello è che puoi sempre recuperare: basta completare partnership in modo professionale e il punteggio risale. È un sistema meritocratico che premia la costanza!`,

            general: `🤖 Ciao! Sono qui per aiutarti con qualsiasi dubbio sulle partnership Discord o sulla gestione del tuo server.\n\nPosso darti consigli strategici su come far crescere la tua community attraverso collaborazioni mirate, spiegarti nel dettaglio come funziona ogni comando del bot, aiutarti a risolvere eventuali problemi tecnici che incontri, o anche solo darti suggerimenti pratici basati sulla mia esperienza.\n\nPer esempio, se mi chiedi "come posso trovare partner affidabili per il mio server di anime?", ti darò una risposta specifica sulla tua situazione. Oppure se vuoi sapere "perché la mia richiesta non è stata ancora approvata?", posso spiegarti esattamente cosa controllare.\n\nNon avere paura di essere specifico nelle domande - più dettagli mi dai, meglio posso aiutarti! Cosa ti serve di sapere oggi?`
        };

        if (question.toLowerCase().includes('minfoai') || question.toLowerCase().includes('cosa fa') || question.toLowerCase().includes('cosa puo')) {
            return responses.bot_info;
        }

        return responses[category] || responses.general;
    }
}

module.exports = new ConversationalAI();
