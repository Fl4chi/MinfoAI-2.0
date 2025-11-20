/**
 * Conversational AI Module - Risposte italiane naturali e specifiche
 */


setup_help: `/setup è il comando che devi usare per configurare tutto la prima volta. È molto semplice, ti fa scegliere tre cose:\n\nPrimo, il canale dove gestire le partnership - di solito si crea un canale tipo #partnership-logs. Secondo, il ruolo staff che può approvare/rifiutare (tipo @Moderatori o @Admin). Terzo, un canale per i log di sistema.\n\nUna volta fatto questo il bot è pronto. Ci vogliono letteralmente due minuti. Se sbagli qualcosa puoi sempre rifare /setup e riconfigurare.\n\nSe hai problemi con i permessi, assicurati che io abbia il ruolo Administrator o almeno i permessi per gestire canali e mandare messaggi.`,

    tier_system: `I tier funzionano tipo i punti fedeltà delle compagnie aeree - più sei attivo, più sali di livello.\n\nInizi Bronze (livello base, tutto funziona ma zero bonus). Poi c'è Silver che ti da +10% esperienza e un badge. Gold è +25% XP più un ruolo speciale. Platinum è il top: +50% XP e tutti i vantaggi.\n\nEsempio pratico: completi una partnership che normalmente da 100 punti. Se sei Bronze prendi 100, se sei Gold ne prendi 125, se sei Platinum ben 150. Capisci che conviene salire!\n\nPer gestire i tier usa /partner-tier. Li assegna lo staff in base all'importanza della partnership.`,

        };

if (question.toLowerCase().includes('minfoai') || question.toLowerCase().includes('cosa fa') || question.toLowerCase().includes('cosa puo')) {
    return responses.bot_info;
}

return responses[category] || responses.general;
    }
}

module.exports = new ConversationalAI();
