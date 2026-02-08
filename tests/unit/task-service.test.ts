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
import { SAMPLE_TODO_MD } from '../helpers/test-utils.js';

const TEST_DIR = join(process.cwd(), 'test-temp');
const TEST_FILE = join(TEST_DIR, 'test-todo.md');

describe('Task Service', () => {
    beforeEach(async () => {
        // Create test directory
        try {
            await fs.mkdir(TEST_DIR, { recursive: true });
        } catch {
            // Ignore if exists
        }
    });

    afterEach(async () => {
        // Cleanup test files
        try {
            await fs.unlink(TEST_FILE);
        } catch {
            // Ignore if doesn't exist
        }
    });

    describe('initTaskFile', () => {
        it('should create new file with empty sections', async () => {
            await initTaskFile(TEST_FILE);
            const content = await fs.readFile(TEST_FILE, 'utf-8');
            expect(content).toContain('# Tasks');
            expect(content).toContain('## backlog');
            expect(content).toContain('## todo');
            expect(content).toContain('## progress');
            expect(content).toContain('## closed');
        });

        it('should throw error if file exists', async () => {
            await initTaskFile(TEST_FILE);
            await expect(initTaskFile(TEST_FILE)).rejects.toThrow('File already exists');
        });
    });

    describe('addTask', () => {
        beforeEach(async () => {
            await initTaskFile(TEST_FILE);
        });

        it('should add task to backlog', async () => {
            const task = await addTask(TEST_FILE, 'Test task');
            expect(task.description).toBe('Test task');
            expect(task.section).toBe('backlog');
            expect(task.id).toBe('001');
            expect(task.idNumber).toBe(1);
        });

        it('should increment ID for subsequent tasks', async () => {
            await addTask(TEST_FILE, 'Task 1');
            const task2 = await addTask(TEST_FILE, 'Task 2');
            expect(task2.id).toBe('002');
            expect(task2.idNumber).toBe(2);
        });
    });

    describe('moveTask', () => {
        beforeEach(async () => {
            await initTaskFile(TEST_FILE);
            await addTask(TEST_FILE, 'Test task');
        });

        it('should move task to different section', async () => {
            await moveTask(TEST_FILE, '001', 'todo');
            const tasks = await listTasks(TEST_FILE);
            expect(tasks[0].section).toBe('todo');
        });

        it('should throw error for invalid section', async () => {
            await expect(moveTask(TEST_FILE, '001', 'invalid')).rejects.toThrow('Invalid section');
        });
    });

    describe('markDone', () => {
        beforeEach(async () => {
            await initTaskFile(TEST_FILE);
            await addTask(TEST_FILE, 'Test task');
        });

        it('should mark task as done and move to closed', async () => {
            await markDone(TEST_FILE, '001');
            const tasks = await listTasks(TEST_FILE);
            const task = tasks[0];
            expect(task.section).toBe('closed');
            expect(task.checked).toBe(true);
            // doneDate removed - no longer set
        });
    });

    describe('markWontdo', () => {
        beforeEach(async () => {
            await initTaskFile(TEST_FILE);
            await addTask(TEST_FILE, 'Test task');
        });

        it('should mark task as wontdo and move to closed', async () => {
            await markWontdo(TEST_FILE, '001');
            const tasks = await listTasks(TEST_FILE);
            const task = tasks[0];
            expect(task.section).toBe('closed');
            expect(task.checked).toBe(false);
            // doneDate removed - no longer used
        });
    });

    describe('removeTask', () => {
        beforeEach(async () => {
            await initTaskFile(TEST_FILE);
            await addTask(TEST_FILE, 'Task 1');
            await addTask(TEST_FILE, 'Task 2');
        });

        it('should remove task from file', async () => {
            await removeTask(TEST_FILE, '001');
            const tasks = await listTasks(TEST_FILE);
            expect(tasks).toHaveLength(1);
            expect(tasks[0].id).toBe('002');
        });
    });

    describe('listTasks', () => {
        beforeEach(async () => {
            await initTaskFile(TEST_FILE);
            await addTask(TEST_FILE, 'Backlog task');
            await addTask(TEST_FILE, 'Another backlog task');
            await moveTask(TEST_FILE, '001', 'todo');
        });

        it('should list all tasks', async () => {
            const tasks = await listTasks(TEST_FILE);
            expect(tasks).toHaveLength(2);
        });

        it('should filter by section', async () => {
            const backlogTasks = await listTasks(TEST_FILE, 'backlog');
            expect(backlogTasks).toHaveLength(1);
            expect(backlogTasks[0].section).toBe('backlog');
        });

        it('should throw error for invalid section', async () => {
            await expect(listTasks(TEST_FILE, 'invalid' as any)).rejects.toThrow('Invalid section');
        });
    });

    describe('error handling', () => {
        beforeEach(async () => {
            await initTaskFile(TEST_FILE);
            await addTask(TEST_FILE, 'Test task');
        });

        it('should throw error when moving non-existent task', async () => {
            await expect(moveTask(TEST_FILE, '999', 'todo')).rejects.toThrow('Task 999 not found');
        });

        it('should throw error when marking non-existent task as done', async () => {
            await expect(markDone(TEST_FILE, '999')).rejects.toThrow('Task 999 not found');
        });

        it('should throw error when marking non-existent task as wontdo', async () => {
            await expect(markWontdo(TEST_FILE, '999')).rejects.toThrow('Task 999 not found');
        });

        it('should throw error when removing non-existent task', async () => {
            await expect(removeTask(TEST_FILE, '999')).rejects.toThrow('Task 999 not found');
        });
    });
});
