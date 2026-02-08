import { describe, it, expect, beforeEach } from 'vitest';
import { Volume, createFsFromVolume } from 'memfs';
import { readMarkdownFile, writeMarkdownFile, fileExists, getFilePath } from '../../src/lib/services/file-manager.js';
import { SAMPLE_TODO_MD } from '../helpers/test-utils.js';

// Mock fs module
const volume = Volume.fromJSON({});
const fs = createFsFromVolume(volume);

// Override fs module for testing
import { promises as fsPromises } from 'fs';
import * as path from 'path';

describe('File Manager', () => {
  const testDir = '/test';
  const testFile = path.join(testDir, 'TODO.md');

  beforeEach(() => {
    // Reset volume
    volume.reset();
  });

  describe('getFilePath', () => {
    it('should return default file path', () => {
      expect(getFilePath()).toBe('TODO.md');
    });

    it('should return custom file path', () => {
      expect(getFilePath('work.md')).toBe('work.md');
    });
  });

  describe('fileExists', () => {
    it('should return false for non-existent file', async () => {
      // Note: This test uses the real file system, so we test the logic
      // In integration tests, we'll use memfs properly
      const result = await fileExists('non-existent-file-12345.md');
      expect(result).toBe(false);
    });
  });

  describe('readMarkdownFile', () => {
    it('should throw error for non-existent file', async () => {
      await expect(readMarkdownFile('non-existent-12345.md')).rejects.toThrow('File not found');
    });
  });

  describe('writeMarkdownFile', () => {
    it('should write content to file', async () => {
      const testPath = 'test-write.md';
      const content = 'Test content';

      await writeMarkdownFile(testPath, content);

      // Verify by reading it back
      const result = await readMarkdownFile(testPath);
      expect(result).toBe(content);

      // Cleanup
      try {
        await fsPromises.unlink(testPath);
      } catch {
        // Ignore cleanup errors
      }
    });
  });
});
