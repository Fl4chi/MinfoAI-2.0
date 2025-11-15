const chalk = require('chalk');

class Logger {
    info(message, ...args) {
        console.log(chalk.blue('[INFO]'), new Date().toLocaleTimeString(), message, ...args);
    }

    success(message, ...args) {
        console.log(chalk.green('[SUCCESS]'), new Date().toLocaleTimeString(), message, ...args);
    }

    warn(message, ...args) {
        console.log(chalk.yellow('[WARN]'), new Date().toLocaleTimeString(), message, ...args);
    }

    error(message, ...args) {
        console.log(chalk.red('[ERROR]'), new Date().toLocaleTimeString(), message, ...args);
    }

    debug(message, ...args) {
        if (process.env.DEBUG === 'true') {
            console.log(chalk.gray('[DEBUG]'), new Date().toLocaleTimeString(), message, ...args);
        }
    }
}

module.exports = new Logger();
