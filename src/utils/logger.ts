import chalk from 'chalk';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export class Logger {
  private minLevel: LogLevel = LogLevel.INFO;

  constructor(verbose: boolean = false) {
    this.minLevel = verbose ? LogLevel.DEBUG : LogLevel.INFO;
  }

  error(message: string, error?: Error): void {
    console.error(chalk.red(`✘ ERROR: ${message}`));
    if (error) {
      console.error(chalk.gray(error.stack || error.message));
    }
  }

  warn(message: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.error(chalk.yellow(`⚠ WARNING: ${message}`));
    }
  }

  info(message: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.error(chalk.blue(`ℹ INFO: ${message}`));
    }
  }

  debug(message: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.error(chalk.gray(`◆ DEBUG: ${message}`));
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    return levels.indexOf(level) <= levels.indexOf(this.minLevel);
  }
}

export const globalLogger = new Logger();
