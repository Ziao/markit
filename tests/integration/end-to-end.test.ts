import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import {
  initTaskFile,
  addTask,
  moveTask,
  markDone,
  markWontdo,
  removeTask,
  listTasks,
  loadTasks,
} from '../../src/lib/services/task-service.js';

const TEST_DIR = join(process.cwd(), 'test-temp');
const TEST_FILE = join(TEST_DIR, 'test-e2e.md');

describe('End-to-End Workflow', () => {
  beforeEach(async () => {
    try {
      await fs.mkdir(TEST_DIR, { recursive: true });
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
    try {
      await fs.rmdir(TEST_DIR);
    } catch {
      // Ignore
    }
  });

  it('should complete full workflow', async () => {
    // 1. Initialize
    await initTaskFile(TEST_FILE);
    
    // 2. Add tasks
    await addTask(TEST_FILE, 'Fix login bug');
    await addTask(TEST_FILE, 'Write tests');
    await addTask(TEST_FILE, 'Update docs');
    
    // 3. Move to todo
    await moveTask(TEST_FILE, '001', 'todo');
    
    // 4. Move to progress
    await moveTask(TEST_FILE, '001', 'progress');
    
    // 5. Mark done
    await markDone(TEST_FILE, '001');
    
    // 6. Mark wontdo
    await markWontdo(TEST_FILE, '003');
    
    // 7. Remove task
    await removeTask(TEST_FILE, '002');
    
    // Verify final state
    const data = await loadTasks(TEST_FILE);
    expect(data.tasks).toHaveLength(2);
    
    const doneTask = data.tasks.find(t => t.idNumber === 1);
    expect(doneTask?.section).toBe('closed');
    expect(doneTask?.checked).toBe(true);
    expect(doneTask?.doneDate).toBeDefined();
    
    const wontdoTask = data.tasks.find(t => t.idNumber === 3);
    expect(wontdoTask?.section).toBe('closed');
    expect(wontdoTask?.checked).toBe(false);
    expect(wontdoTask?.doneDate).toBeUndefined();
  });

  it('should maintain sequential IDs after deletions', async () => {
    await initTaskFile(TEST_FILE);
    await addTask(TEST_FILE, 'Task 1');
    await addTask(TEST_FILE, 'Task 2');
    await addTask(TEST_FILE, 'Task 3');
    
    await removeTask(TEST_FILE, '002');
    
    const task4 = await addTask(TEST_FILE, 'Task 4');
    // Should be #004, not #002 (IDs never reused)
    expect(task4.id).toBe('004');
    expect(task4.idNumber).toBe(4);
  });
});
