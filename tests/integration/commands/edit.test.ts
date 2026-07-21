import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { initTaskFile, addTask, editTask, moveTask, loadTasks } from '../../../src/lib/services/task-service.js';

const TEST_DIR = join(process.cwd(), 'test-temp');
const TEST_FILE = join(TEST_DIR, 'test-edit.md');

describe('Edit Command Integration', () => {
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

    it('should edit task description and persist to file', async () => {
        await addTask(TEST_FILE, 'Old description');
        await editTask(TEST_FILE, '001', 'New description #feature');

        const content = await fs.readFile(TEST_FILE, 'utf-8');
        expect(content).toContain('id:001 New description #feature');
        expect(content).not.toContain('Old description');

        const data = await loadTasks(TEST_FILE);
        expect(data.tasks[0].description).toBe('New description #feature');
        expect(data.tasks[0].tags).toEqual(['feature']);
    });

    it('should preserve section when editing', async () => {
        await addTask(TEST_FILE, 'Task in backlog');
        await moveTask(TEST_FILE, '001', 'progress');
        await editTask(TEST_FILE, '001', 'Still in progress');

        const data = await loadTasks(TEST_FILE);
        expect(data.tasks[0].section).toBe('progress');
        expect(data.tasks[0].description).toBe('Still in progress');
    });
});
