import { readFile, writeFile, access } from 'fs/promises';
import { constants } from 'fs';

const DEFAULT_FILE = 'TODO.md';

export function getFilePath(customPath?: string): string {
  if (customPath) {
    return customPath;
  }
  return DEFAULT_FILE;
}

export async function readMarkdownFile(filePath?: string): Promise<string> {
  const path = getFilePath(filePath);
  
  try {
    return await readFile(path, 'utf-8');
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error(`File not found: ${path}. Use 'markit init' to create it.`);
    }
    if (error.code === 'EACCES') {
      throw new Error(`Permission denied: ${path}. File is read-only.`);
    }
    throw new Error(`Failed to read file ${path}: ${error.message}`);
  }
}

export async function writeMarkdownFile(filePath: string | undefined, content: string): Promise<void> {
  const path = getFilePath(filePath);
  
  try {
    await writeFile(path, content, 'utf-8');
  } catch (error: any) {
    if (error.code === 'EACCES') {
      throw new Error(`Permission denied: ${path}. File is read-only.`);
    }
    if (error.code === 'ENOSPC') {
      throw new Error(`No space left on device. Cannot write to ${path}.`);
    }
    throw new Error(`Failed to write file ${path}: ${error.message}`);
  }
}

export async function fileExists(filePath?: string): Promise<boolean> {
  const path = getFilePath(filePath);
  
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
