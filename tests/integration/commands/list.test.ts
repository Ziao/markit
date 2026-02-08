import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { initTaskFile, addTask, moveTask, listTasks } from '../../../src/lib/services/task-service.js';

const TEST_DIR = join(process.cwd(), 'test-temp');
const TEST_FILE = join(TEST_DIR, 'test-list.md');

describe('List Command Integration', () => {
    beforeEach(async () => {
        try {
            await fs.mkdir(TEST_DIR, { recursive: true });
            await initTaskFile(TEST_FILE);
            await addTask(TEST_FILE, 'Backlog task 1');
            await addTask(TEST_FILE, 'Backlog task 2');
            await moveTask(TEST_FILE, '001', 'todo');
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

    it('should list all tasks', async () => {
        const tasks = await listTasks(TEST_FILE);
        expect(tasks).toHaveLength(2);
    });

    it('should filter by section', async () => {
        const backlogTasks = await listTasks(TEST_FILE, 'backlog');
        expect(backlogTasks).toHaveLength(1);
        expect(backlogTasks[0].section).toBe('backlog');

        const todoTasks = await listTasks(TEST_FILE, 'todo');
        expect(todoTasks).toHaveLength(1);
        expect(todoTasks[0].section).toBe('todo');
    });
});
