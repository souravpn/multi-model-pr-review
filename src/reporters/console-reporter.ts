import ora from 'ora';

export class ConsoleReporter {
  static createSpinner(message: string) {
    return ora(message).start();
  }

  static success(message: string): void {
    ora(message).succeed();
  }

  static error(message: string, error?: Error): void {
    ora(message).fail();
    if (error) {
      console.error(error.message);
    }
  }

  static info(message: string): void {
    console.error(`ℹ ${message}`);
  }

  static printTable(
    title: string,
    data: Array<Record<string, string | number>>
  ): void {
    if (data.length === 0) {
      console.log(`${title}: No data`);
      return;
    }

    console.log(`\n${title}`);
    const headers = Object.keys(data[0]);
    const columnWidths = headers.map((h) =>
      Math.max(
        h.length,
        ...data.map((row) => String(row[h]).length)
      )
    );

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
