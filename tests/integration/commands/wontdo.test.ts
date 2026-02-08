import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { initTaskFile, addTask, markWontdo, loadTasks } from '../../../src/lib/services/task-service.js';

const TEST_DIR = join(process.cwd(), 'test-temp');
const TEST_FILE = join(TEST_DIR, 'test-wontdo.md');

describe('Wontdo Command Integration', () => {
  beforeEach(async () => {
    try {
      await fs.mkdir(TEST_DIR, { recursive: true });
      await initTaskFile(TEST_FILE);
      await addTask(TEST_FILE, 'Test task');
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

  it('should mark task as wontdo and move to closed', async () => {
    await markWontdo(TEST_FILE, '001');

    const data = await loadTasks(TEST_FILE);
    const task = data.tasks[0];

    expect(task.section).toBe('closed');
    expect(task.checked).toBe(false);
    // doneDate removed - no longer used
  });
});
