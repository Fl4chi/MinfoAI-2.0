// MinfoAI - AI Chat Assistant with Gemini API
// Error Logging & Console Monitoring System

// ===== ERROR LOGGING SYSTEM =====
class ErrorLogger {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.init();
    }

    init() {
        // Override console methods for tracking
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalLog = console.log;

        console.error = (...args) => {
            this.logError('ERROR', args);
            originalError.apply(console, args);
        };

        console.warn = (...args) => {
            this.logError('WARNING', args);
            originalWarn.apply(console, args);
        };

        // Global error handler
        window.addEventListener('error', (e) => {
            this.logError('RUNTIME_ERROR', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno
            });
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.logError('PROMISE_REJECTION', {
                reason: e.reason
            });
        });

        console.log('%c[MinfoAI] Error Logging System Initialized', 'color: #6366f1; font-weight: bold');
    }

    logError(type, data) {
        const error = {
            type,
            data,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };

        if (type.includes('ERROR')) {
            this.errors.push(error);
        } else {
            this.warnings.push(error);
        }

        // Log to console with styling
        console.log(`%c[${type}]`, `color: ${type.includes('ERROR') ? '#ef4444' : '#eab308'}; font-weight: bold`, data);
    }

    getReport() {
        return {
            errors: this.errors,
            warnings: this.warnings,
            totalErrors: this.errors.length,
            totalWarnings: this.warnings.length
        };
    }
}

const errorLogger = new ErrorLogger();

// ===== AI CHAT ASSISTANT =====
class AIChat {
    constructor() {
        this.messages = [];
        this.isOpen = false;
        this.apiKey = null; // Will be loaded from backend
        this.init();
    }

    async init() {
        console.log('%c[MinfoAI] AI Chat Assistant Initialized', 'color: #a855f7; font-weight: bold');
        console.log('%c[MinfoAI] Using backend API endpoint', 'color: #94a3b8');
    }

    async sendMessage(message) {
        if (!message.trim()) return;

        // Add user message
        this.addMessage(message, 'user');

        // Show typing indicator
        this.showTyping();

        try {
            const response = await this.callGeminiAPI(message);
            this.hideTyping();
            this.addMessage(response, 'bot');
        } catch (error) {
            this.hideTyping();

            const p = document.createElement('p');
            p.textContent = text;
            messageDiv.appendChild(p);

            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            this.messages.push({ text, sender, timestamp: new Date() });
        }

        showTyping() {
            const messagesContainer = document.getElementById('chatMessages');
            const typingDiv = document.createElement('div');
            typingDiv.className = 'chat-message bot-message typing-indicator';
            typingDiv.id = 'typingIndicator';
            typingDiv.innerHTML = '<p><span></span><span></span><span></span></p>';
            messagesContainer.appendChild(typingDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        hideTyping() {
            const typing = document.getElementById('typingIndicator');
            if (typing) typing.remove();
        }
    }

    const aiChat = new AIChat();

// ===== GLOBAL FUNCTIONS =====
function toggleChat() {
    const widget = document.getElementById('ai-chat-widget');
    const fab = document.querySelector('.chat-fab');

    if (widget.classList.contains('open')) {
        widget.classList.remove('open');
        fab.classList.remove('hidden');
    } else {
        widget.classList.add('open');
        fab.classList.add('hidden');
    }
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (message) {
        aiChat.sendMessage(message);
        input.value = '';
    }
}

// ===== PERFORMANCE MONITORING =====
window.addEventListener('load', () => {
    const perfData = performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log(`%c[Performance] Page loaded in ${pageLoadTime}ms`, 'color: #22c55e; font-weight: bold');
});

// ===== EXPORT FOR DEBUGGING =====
window.MinfoAI = {
    errorLogger,
    aiChat,
    getErrorReport: () => errorLogger.getReport(),
    version: '2.0.0'
};

console.log('%c🤖 MinfoAI Website Loaded Successfully!', 'color: #6366f1; font-size: 16px; font-weight: bold');
console.log('%cType MinfoAI.getErrorReport() to view error logs', 'color: #94a3b8');
