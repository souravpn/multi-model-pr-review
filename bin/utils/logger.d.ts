export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug"
}
export declare class Logger {
    private minLevel;
    constructor(verbose?: boolean);
    error(message: string, error?: Error): void;
    warn(message: string): void;
    info(message: string): void;
    debug(message: string): void;
    private shouldLog;
}
export declare const globalLogger: Logger;
//# sourceMappingURL=logger.d.ts.map