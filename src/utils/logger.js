const chalk = require('chalk');

class Logger {
    info(message, context = '') {
        const log = `ℹ️  [INFO] ${message}${context ? ` | ${context}` : ''}`;
        console.log(chalk.blue(log));

        // Send to dashboard
        if (global.dashboardLogger) {
            global.dashboardLogger.log(`${message}${context ? ` | ${context}` : ''}`);
        }
    }

    success(message, context = '') {
        const log = `✅ [SUCCESS] ${message}${context ? ` | ${context}` : ''}`;
        console.log(chalk.green(log));

        // Send to dashboard
        if (global.dashboardLogger) {
            global.dashboardLogger.log(`[SUCCESS] ${message}${context ? ` | ${context}` : ''}`);
        }
    }

    warn(message, context = '') {
        const log = `⚠️  [WARN] ${message}${context ? ` | ${context}` : ''}`;
        console.log(chalk.yellow(log));

        // Send to dashboard
        if (global.dashboardLogger) {
            global.dashboardLogger.warn(`${message}${context ? ` | ${context}` : ''}`);
        }
    }

    error(message, error = null) {
        const log = `❌ [ERROR] ${message}${error ? `\n${error.stack}` : ''}`;
        console.log(chalk.red(log));

        // Send to dashboard
        if (global.dashboardLogger) {
            global.dashboardLogger.error(`${message}${error ? ` | ${error.message}` : ''}`);
        }
    }

    debug(message) {
        if (process.env.DEBUG === 'true') {
            console.log(chalk.gray(`🔍 [DEBUG] ${message}`));
        }
    }
}

module.exports = new Logger();
