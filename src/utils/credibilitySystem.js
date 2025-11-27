/**
 * MinfoAI 2.0 - Credibility Score System
 * Calcola un punteggio da 0 a 100 basato su metriche utente.
 */

class CredibilitySystem {
    constructor() {
        this.weights = {
            accountAge: 0.30,      // 30%
            messageActivity: 0.20, // 20%
            serverRoles: 0.15,     // 15%
            pastPartnerships: 0.15,// 15%
            walletBalance: 0.10,   // 10%
            reputation: 0.10       // 10%
        };
    }

    /**
     * Calcola il Credibility Score per un utente
     * @param {Object} data - Dati utente
     * @returns {Object} Score e dettagli
     */
    calculateScore(data) {
        // Normalizzazione valori (0-100)
        const scores = {
            accountAge: this.normalize(data.accountAgeDays, 0, 365 * 2), // Cap a 2 anni
            messageActivity: this.normalize(data.messagesSent, 0, 1000), // Cap a 1000 msg
            serverRoles: this.normalize(data.rolesCount, 1, 10),         // Cap a 10 ruoli
            pastPartnerships: this.normalize(data.partnershipsCount, 0, 20), // Cap a 20 partnership
            walletBalance: this.normalize(data.coins, 0, 5000),          // Cap a 5000 coins
            reputation: this.normalize(data.repPoints, 0, 50)            // Cap a 50 rep
        };

        // Calcolo ponderato
        let totalScore = 
            (scores.accountAge * this.weights.accountAge) +
            (scores.messageActivity * this.weights.messageActivity) +
            (scores.serverRoles * this.weights.serverRoles) +
            (scores.pastPartnerships * this.weights.pastPartnerships) +
            (scores.walletBalance * this.weights.walletBalance) +
            (scores.reputation * this.weights.reputation);

        totalScore = Math.min(Math.max(Math.round(totalScore), 0), 100);

        return {
            score: totalScore,
            level: this.getLevel(totalScore),
            breakdown: scores
        };
    }

    normalize(value, min, max) {
        return Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
    }

    getLevel(score) {
        if (score >= 71) return { label: '🟢 Credibilità Alta (Trusted)', color: '#22c55e' };
        if (score >= 41) return { label: '🟡 Credibilità Media (Standard)', color: '#eab308' };
        return { label: '🔴 Credibilità Bassa (Risk)', color: '#ef4444' };
    }

    /**
     * Rileva pattern di frode potenziali
     */
    detectFraud(data) {
        const flags = [];
        if (data.accountAgeDays < 7) flags.push("Account troppo recente (< 7 giorni)");
        if (data.messagesSent < 10) flags.push("Attività messaggi sospetta (quasi nulla)");
        if (data.partnershipsCount > 5 && data.accountAgeDays < 30) flags.push("Troppe partnership per un account nuovo");
        
        return {
            isSuspicious: flags.length > 0,
            flags: flags
        };
    }
}

module.exports = new CredibilitySystem();
