"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleReporter = void 0;
const ora_1 = __importDefault(require("ora"));
class ConsoleReporter {
    static createSpinner(message) {
        return (0, ora_1.default)(message).start();
    }
    static success(message) {
        (0, ora_1.default)(message).succeed();
    }
    static error(message, error) {
        (0, ora_1.default)(message).fail();
        if (error) {
            console.error(error.message);
        }
    }
    static info(message) {
        console.error(`ℹ ${message}`);
    }
    static printTable(title, data) {
        if (data.length === 0) {
            console.log(`${title}: No data`);
            return;
        }
        console.log(`\n${title}`);
        const headers = Object.keys(data[0]);
        const columnWidths = headers.map((h) => Math.max(h.length, ...data.map((row) => String(row[h]).length)));
        // Print header
        const headerRow = headers
            .map((h, i) => h.padEnd(columnWidths[i]))
            .join(' | ');
        console.log(headerRow);
        console.log(headers.map((_, i) => '−'.repeat(columnWidths[i])).join('−|−'));
        // Print rows
        data.forEach((row) => {
            const rowStr = headers
                .map((h, i) => String(row[h]).padEnd(columnWidths[i]))
                .join(' | ');
            console.log(rowStr);
        });
    }
}
exports.ConsoleReporter = ConsoleReporter;
//# sourceMappingURL=console-reporter.js.map