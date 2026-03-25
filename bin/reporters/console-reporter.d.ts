import ora from 'ora';
export declare class ConsoleReporter {
    static createSpinner(message: string): ora.Ora;
    static success(message: string): void;
    static error(message: string, error?: Error): void;
    static info(message: string): void;
    static printTable(title: string, data: Array<Record<string, string | number>>): void;
}
//# sourceMappingURL=console-reporter.d.ts.map