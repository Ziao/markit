import { describe, it, expect } from 'vitest';
import { parseMarkdown } from '../../src/lib/core/parser.js';
import { SAMPLE_TODO_MD } from '../helpers/test-utils.js';

describe('Parser', () => {
    it('should parse simple task', () => {
        const markdown = `## backlog
- [ ] id:001 Task description
`;
        const result = parseMarkdown(markdown);
        expect(result.tasks).toHaveLength(1);
        expect(result.tasks[0].description).toBe('Task description');
        expect(result.tasks[0].id).toBe('001');
        expect(result.tasks[0].section).toBe('backlog');
        expect(result.tasks[0].checked).toBe(false);
    });

    it('should parse task with metadata', () => {
        const markdown = `## backlog
- [ ] id:001 Fix bug #urgent @john due:2025-01-15
`;
        const result = parseMarkdown(markdown);
        expect(result.tasks[0].tags).toContain('urgent');
        expect(result.tasks[0].mentions).toContain('john');
        expect(result.tasks[0].dueDate).toBe('2025-01-15');
    });

    it('should parse completed task', () => {
        const markdown = `## closed
- [x] id:001 Completed task
`;
        const result = parseMarkdown(markdown);
        expect(result.tasks[0].checked).toBe(true);
    });

    it('should parse tasks with IDs greater than 999', () => {
        const markdown = `## backlog
- [ ] id:999 Task 999
- [ ] id:1000 Task 1000
- [ ] id:1234 Task 1234
`;
        const result = parseMarkdown(markdown);
        expect(result.tasks).toHaveLength(3);
        expect(result.tasks[0].idNumber).toBe(999);
        expect(result.tasks[0].id).toBe('999');
        expect(result.tasks[1].idNumber).toBe(1000);
        expect(result.tasks[1].id).toBe('1000');
        expect(result.tasks[2].idNumber).toBe(1234);
        expect(result.tasks[2].id).toBe('1234');
        expect(result.nextId).toBe(1235);
    });

    it('should parse multiple sections', () => {
        const result = parseMarkdown(SAMPLE_TODO_MD);
        expect(result.tasks).toHaveLength(7);

        const backlog = result.tasks.filter(t => t.section === 'backlog');
        const todo = result.tasks.filter(t => t.section === 'todo');
        const progress = result.tasks.filter(t => t.section === 'progress');
        const closed = result.tasks.filter(t => t.section === 'closed');

        expect(backlog).toHaveLength(2);
        expect(todo).toHaveLength(1);
        expect(progress).toHaveLength(1);
        expect(closed).toHaveLength(3);
    });

    it('should calculate next ID correctly', () => {
        const result = parseMarkdown(SAMPLE_TODO_MD);
        expect(result.nextId).toBe(8); // Highest ID is 7, so next is 8
    });

    it('should handle empty sections', () => {
        const markdown = `## backlog

## todo
- [ ] id:001 Task
`;
        const result = parseMarkdown(markdown);
        expect(result.tasks).toHaveLength(1);
        expect(result.tasks[0].section).toBe('todo');
    });

    it('should skip tasks without IDs', () => {
        const markdown = `## backlog
- [ ] Task without ID
- [ ] id:001 Task with ID
`;
        const result = parseMarkdown(markdown);
        expect(result.tasks).toHaveLength(1);
        expect(result.tasks[0].description).toBe('Task with ID');
    });

    it('should skip tasks outside sections', () => {
        const markdown = `- [ ] id:001 Task outside section
## backlog
- [ ] id:002 Task in section
`;
        const result = parseMarkdown(markdown);
        expect(result.tasks).toHaveLength(1);
        expect(result.tasks[0].id).toBe('002');
    });

    it('should handle multiple tags and mentions', () => {
        const markdown = `## backlog
- [ ] id:001 Task #bug #urgent @john @jane due:2025-01-15
`;
        const result = parseMarkdown(markdown);
        expect(result.tasks[0].tags).toEqual(['bug', 'urgent']);
        expect(result.tasks[0].mentions).toEqual(['john', 'jane']);
    });

    it('should skip malformed checkbox lines', () => {
        const markdown = `## backlog
- [invalid] id:001 Valid task
- [ ] id:002 Another valid task
`;
        const result = parseMarkdown(markdown);
        // Only the valid checkbox task should be parsed
        expect(result.tasks).toHaveLength(1);
        expect(result.tasks[0].id).toBe('002');
    });

    it('should skip lines that start with - but are not checkboxes', () => {
        const markdown = `## backlog
- This is just a list item, not a task
- [ ] id:001 Valid task
`;
        const result = parseMarkdown(markdown);
        expect(result.tasks).toHaveLength(1);
        expect(result.tasks[0].id).toBe('001');
    });
});
