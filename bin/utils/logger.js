"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalLogger = exports.Logger = exports.LogLevel = void 0;
const chalk_1 = __importDefault(require("chalk"));
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor(verbose = false) {
        this.minLevel = LogLevel.INFO;
        this.minLevel = verbose ? LogLevel.DEBUG : LogLevel.INFO;
    }
    error(message, error) {
        console.error(chalk_1.default.red(`✘ ERROR: ${message}`));
        if (error) {
            console.error(chalk_1.default.gray(error.stack || error.message));
        }
    }
    warn(message) {
        if (this.shouldLog(LogLevel.WARN)) {
            console.error(chalk_1.default.yellow(`⚠ WARNING: ${message}`));
        }
    }
    info(message) {
        if (this.shouldLog(LogLevel.INFO)) {
            console.error(chalk_1.default.blue(`ℹ INFO: ${message}`));
        }
    }
    debug(message) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.error(chalk_1.default.gray(`◆ DEBUG: ${message}`));
        }
    }
    shouldLog(level) {
        const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
        return levels.indexOf(level) <= levels.indexOf(this.minLevel);
    }
}
exports.Logger = Logger;
exports.globalLogger = new Logger();
//# sourceMappingURL=logger.js.map