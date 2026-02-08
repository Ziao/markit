import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { initTaskFile, addTask, moveTask, loadTasks } from '../../../src/lib/services/task-service.js';

const TEST_DIR = join(process.cwd(), 'test-temp');
const TEST_FILE = join(TEST_DIR, 'test-move.md');

describe('Move Command Integration', () => {
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

    it('should move task between sections', async () => {
        await moveTask(TEST_FILE, '001', 'todo');
        const data = await loadTasks(TEST_FILE);
        expect(data.tasks[0].section).toBe('todo');

        await moveTask(TEST_FILE, '001', 'progress');
        const data2 = await loadTasks(TEST_FILE);
        expect(data2.tasks[0].section).toBe('progress');
    });

    it('should accept ID with or without #', async () => {
        await moveTask(TEST_FILE, '#001', 'todo');
        const data = await loadTasks(TEST_FILE);
        expect(data.tasks[0].section).toBe('todo');
    });
});
