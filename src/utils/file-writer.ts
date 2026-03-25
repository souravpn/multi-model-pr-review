import * as fs from 'fs';
import * as path from 'path';

export async function writeFile(
  filepath: string | null,
  content: string
): Promise<string> {
  if (!filepath) {
    // Output to stdout
    console.log(content);
    return 'stdout';
  }

  const dir = path.dirname(filepath);
  if (dir && dir !== '.') {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filepath, content, 'utf-8');
  return filepath;
}

export async function readFile(filepath: string): Promise<string> {
  return fs.promises.readFile(filepath, 'utf-8');
}
