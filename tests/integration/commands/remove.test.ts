import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { initTaskFile, addTask, removeTask, loadTasks } from '../../../src/lib/services/task-service.js';

const TEST_DIR = join(process.cwd(), 'test-temp');
const TEST_FILE = join(TEST_DIR, 'test-remove.md');

describe('Remove Command Integration', () => {
  beforeEach(async () => {
    try {
      await fs.mkdir(TEST_DIR, { recursive: true });
      await initTaskFile(TEST_FILE);
      await addTask(TEST_FILE, 'Task 1');
      await addTask(TEST_FILE, 'Task 2');
      await addTask(TEST_FILE, 'Task 3');
    } catch {
      // Ignore
    }
  });

  afterEach(async () => {
    try {
      await fs.unlink(TEST_FILE);
    } catch {
      // Ignore
    }
  });

  it('should remove task from file', async () => {
    await removeTask(TEST_FILE, '002');

    const data = await loadTasks(TEST_FILE);
    expect(data.tasks).toHaveLength(2);
    expect(data.tasks.find((t) => t.idNumber === 2)).toBeUndefined();
  });

  it('should not affect other tasks', async () => {
    await removeTask(TEST_FILE, '001');

    const data = await loadTasks(TEST_FILE);
    expect(data.tasks).toHaveLength(2);
    expect(data.tasks.find((t) => t.idNumber === 2)).toBeDefined();
    expect(data.tasks.find((t) => t.idNumber === 3)).toBeDefined();
  });
});
