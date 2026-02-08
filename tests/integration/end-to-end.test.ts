import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { initTaskFile, addTask, moveTask, markDone, markWontdo, removeTask, listTasks, loadTasks } from '../../src/lib/services/task-service.js';

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

    const doneTask = data.tasks.find((t) => t.idNumber === 1);
    expect(doneTask?.section).toBe('closed');
    expect(doneTask?.checked).toBe(true);
    // doneDate removed - no longer set

    const wontdoTask = data.tasks.find((t) => t.idNumber === 3);
    expect(wontdoTask?.section).toBe('closed');
    expect(wontdoTask?.checked).toBe(false);
    // doneDate removed - no longer used
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

  it('should handle IDs greater than 999', async () => {
    await initTaskFile(TEST_FILE);

    // Add many tasks to reach ID 1000
    for (let i = 0; i < 1000; i++) {
      await addTask(TEST_FILE, `Task ${i + 1}`);
    }

    const data = await loadTasks(TEST_FILE);
    expect(data.tasks).toHaveLength(1000);
    expect(data.nextId).toBe(1001);

    // Verify task 999
    const task999 = data.tasks.find((t) => t.idNumber === 999);
    expect(task999?.id).toBe('999');
    expect(task999?.idNumber).toBe(999);

    // Verify task 1000
    const task1000 = data.tasks.find((t) => t.idNumber === 1000);
    expect(task1000?.id).toBe('1000');
    expect(task1000?.idNumber).toBe(1000);

    // Add one more task - should be 1001
    const task1001 = await addTask(TEST_FILE, 'Task 1001');
    expect(task1001.id).toBe('1001');
    expect(task1001.idNumber).toBe(1001);

    // Test operations with ID 1000
    await moveTask(TEST_FILE, '1000', 'todo');
    const movedTask = await listTasks(TEST_FILE, 'todo');
    expect(movedTask[0].idNumber).toBe(1000);
    expect(movedTask[0].id).toBe('1000');

    await markDone(TEST_FILE, '1000');
    const doneTask = await listTasks(TEST_FILE, 'closed');
    expect(doneTask.find((t) => t.idNumber === 1000)?.checked).toBe(true);
  });
});
