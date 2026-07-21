import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { cleanTaskFile, loadTasks } from '../../../src/lib/services/task-service.js';

const TEST_DIR = join(process.cwd(), 'test-temp');
const TEST_FILE = join(TEST_DIR, 'test-clean.md');

describe('Clean Command Integration', () => {
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

    it('should normalize ordering without losing tasks', async () => {
        await fs.writeFile(
            TEST_FILE,
            `# Tasks

## progress
- [ ] id:002 In progress

## backlog
- [ ] id:001 Backlog task
`,
            'utf-8'
        );

        await cleanTaskFile(TEST_FILE);

        const data = await loadTasks(TEST_FILE);
        expect(data.tasks).toHaveLength(2);
        expect(data.tasks.find(t => t.idNumber === 1)?.section).toBe('backlog');
        expect(data.tasks.find(t => t.idNumber === 2)?.section).toBe('progress');

        const content = await fs.readFile(TEST_FILE, 'utf-8');
        const backlogIndex = content.indexOf('## backlog');
        const progressIndex = content.indexOf('## progress');
        expect(backlogIndex).toBeLessThan(progressIndex);
    });
});
