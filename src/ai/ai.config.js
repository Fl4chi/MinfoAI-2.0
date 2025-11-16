/**
 * AI Configuration Module
 * Configurazione centralizzata per il sistema AI del bot
 * Gestisce: profili utenti, matching partnership, assistenza staff
 */

const AIConfig = {
  // 🔧 Configurazione AI Engine
  engine: {
    type: process.env.AI_ENGINE || 'memory',
    // type: 'ollama' (per local deployment)
    // type: 'huggingface' (per cloud deployment)
    // type: 'memory' (for development/testing)
  },

  // 👤 Configurazione User Profiler
  userProfiler: {
    // Dati da raccogliere su ogni utente
    collectableData: [
      'userId',
      'username',
      'guilds',
      'roles',
      'joinDate',
      'interactionHistory',
      'preferredPartners'
    ],
    // Calcolo della score di compatibilità
    compatibilityWeights: {
      guildMatch: 0.35,
      roleMatch: 0.25,
      historyMatch: 0.20,
      typologyMatch: 0.20
    }
  },

  // 🤝 Configurazione Partnership Matcher
  partnershipMatcher: {
    // Soglia minima di compatibilità (0-100)
    minCompatibilityThreshold: 60,
    // Numero di raccomandazioni da fornire
    recommendationsPerUser: 3,
    // Fattori di matching
    matchingFactors: {
      serverType: true,         // Tipo di server (gaming, social, etc)
      memberSize: true,         // Dimensione community
      activityLevel: true,       // Livello di attività
      languagePreference: true,  // Preferenza lingua
      contentFocus: true         // Focus contenuto
    },
    // Categorie partner
    partnerCategories: [
      'gaming',
      'social',
      'learning',
      'creative',
      'business',
      'community'
    ]
  },

  // 👨‍💼 Configurazione Staff Assistant
  staffAssistant: {
    // Dati disponibili per lo staff
    staffViewableData: [
      'userId',
      'username',
      'guildCount',
      'compatibilityScore',
      'recommendedPartners'
    ],
    // Privilegi staff
    staffPrivileges: {
      viewUserProfiles: true,
      reviewPendingRequests: true,
      approveDenials: true,
      generateAnalytics: true,
      manageSuggestedPartners: true
    },
    // Notifiche staff
    notifications: {
      pendingRequestsReminder: true,
      reminderInterval: 86400000, // 24 ore in ms
      criticalAlertsOnly: false
    }
  },

  // 🛡️ Privacy e Sicurezza
  privacy: {
    // Dati SENSIBILI da non raccogliere
    excludedData: [
      'passwords',
      'tokenData',
      'billingInfo',
      'personalEmailInContent'
    ],
    // Encryption per dati sensibili
    encryptStorage: true,
    // Retention policy (giorni)
    dataRetentionDays: 90,
    // Anonimizzazione automatica
    autoAnonymize: true
  },

  // 📊 Database Collections
  database: {
    collections: {
      userProfiles: 'userProfiles',
      partnershipMatches: 'partnershipMatches',
      staffAnalytics: 'staffAnalytics',
      aiLearningData: 'aiLearningData'
    }
  },

  // 🔌 API Rate Limiting
  rateLimiting: {
    userProfilerCalls: 100, // per ora
    matcherCalls: 50,
    staffQueriesPerDay: 1000
  },

  // 📝 Error Codes per AI System
  errorCodes: {
    AI_ENGINE_ERROR: 8000,
    PROFILER_ERROR: 8001,
    MATCHER_ERROR: 8002,
    STAFF_ERROR: 8003,
    PRIVACY_VIOLATION: 8004,
    RATE_LIMIT_EXCEEDED: 8005
  },

  // 🎯 Feature Flags
  features: {
    userProfiling: true,
    partnershipMatching: true,
    staffDashboard: true,
    predictiveAnalytics: true,
    autoRecommendations: true
  }
};

module.exports = AIConfig;
