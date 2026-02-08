import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { initTaskFile, addTask, loadTasks } from '../../../src/lib/services/task-service.js';

const TEST_DIR = join(process.cwd(), 'test-temp');
const TEST_FILE = join(TEST_DIR, 'test-add.md');

describe('Add Command Integration', () => {
    beforeEach(async () => {
        try {
            await fs.mkdir(TEST_DIR, { recursive: true });
            await initTaskFile(TEST_FILE);
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

    it('should add task to backlog with sequential ID', async () => {
        const task = await addTask(TEST_FILE, 'Fix login bug');

        expect(task.section).toBe('backlog');
        expect(task.id).toBe('001');
        expect(task.idNumber).toBe(1);
        expect(task.description).toBe('Fix login bug');

        const data = await loadTasks(TEST_FILE);
        expect(data.tasks).toHaveLength(1);
        expect(data.nextId).toBe(2);
    });

    it('should increment IDs correctly', async () => {
        await addTask(TEST_FILE, 'Task 1');
        await addTask(TEST_FILE, 'Task 2');
        const task3 = await addTask(TEST_FILE, 'Task 3');

        expect(task3.id).toBe('003');
        expect(task3.idNumber).toBe(3);

        const data = await loadTasks(TEST_FILE);
        expect(data.tasks).toHaveLength(3);
        expect(data.nextId).toBe(4);
    });
});
