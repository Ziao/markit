import { describe, it, expect } from 'vitest';
import { formatMarkdown, formatEmptyFile } from '../../src/lib/core/formatter.js';
import { Task, TaskData } from '../../src/lib/core/task.js';

describe('Formatter', () => {
  it('should format empty file', () => {
    const result = formatEmptyFile();
    expect(result).toContain('# Tasks');
    expect(result).toContain('## backlog');
    expect(result).toContain('## todo');
    expect(result).toContain('## progress');
    expect(result).toContain('## closed');
  });

  it('should format single task', () => {
    const task: Task = {
      id: '001',
      idNumber: 1,
      description: 'Test task',
      section: 'backlog',
      checked: false,
      tags: [],
      mentions: [],
    };

    const data: TaskData = {
      tasks: [task],
      nextId: 2,
    };

    const result = formatMarkdown(data);
    expect(result).toContain('- [ ] id:001 Test task');
    expect(result).toContain('## backlog');
  });

  it('should format task with metadata', () => {
    // When tags are in description, they stay inline
    const task: Task = {
      id: '001',
      idNumber: 1,
      description: 'Fix bug #bug #urgent @john',
      section: 'backlog',
      checked: false,
      tags: ['bug', 'urgent'], // Extracted for searching
      mentions: ['john'],
      dueDate: '2025-01-15',
    };

    const data: TaskData = {
      tasks: [task],
      nextId: 2,
    };

    const result = formatMarkdown(data);
    // Tags and mentions stay inline in description
    expect(result).toContain('id:001 Fix bug #bug #urgent @john');
    expect(result).toContain('due:2025-01-15');
  });

  it('should format completed task', () => {
    const task: Task = {
      id: '001',
      idNumber: 1,
      description: 'Completed task',
      section: 'closed',
      checked: true,
      tags: [],
      mentions: [],
    };

    const data: TaskData = {
      tasks: [task],
      nextId: 2,
    };

    const result = formatMarkdown(data);
    expect(result).toContain('- [x] id:001 Completed task');
  });

  it('should maintain section order', () => {
    const tasks: Task[] = [
      {
        id: '001',
        idNumber: 1,
        description: 'Task 1',
        section: 'closed',
        checked: true,
        tags: [],
        mentions: [],
      },
      {
        id: '002',
        idNumber: 2,
        description: 'Task 2',
        section: 'backlog',
        checked: false,
        tags: [],
        mentions: [],
      },
    ];

    const data: TaskData = {
      tasks,
      nextId: 3,
    };

    const result = formatMarkdown(data);
    const lines = result.split('\n');

    // Check section order
    const backlogIndex = lines.findIndex((l) => l.includes('## backlog'));
    const closedIndex = lines.findIndex((l) => l.includes('## closed'));

    expect(backlogIndex).toBeLessThan(closedIndex);
  });

  it('should sort tasks by ID within sections', () => {
    const tasks: Task[] = [
      {
        id: '003',
        idNumber: 3,
        description: 'Task 3',
        section: 'backlog',
        checked: false,
        tags: [],
        mentions: [],
      },
      {
        id: '001',
        idNumber: 1,
        description: 'Task 1',
        section: 'backlog',
        checked: false,
        tags: [],
        mentions: [],
      },
      {
        id: '002',
        idNumber: 2,
        description: 'Task 2',
        section: 'backlog',
        checked: false,
        tags: [],
        mentions: [],
      },
    ];

    const data: TaskData = {
      tasks,
      nextId: 4,
    };

    const result = formatMarkdown(data);
    const lines = result.split('\n');
    const taskLines = lines.filter((l) => l.includes('id:'));

    expect(taskLines[0]).toContain('id:001');
    expect(taskLines[1]).toContain('id:002');
    expect(taskLines[2]).toContain('id:003');
  });

  it('should format tasks with IDs greater than 999', () => {
    const tasks: Task[] = [
      {
        id: '999',
        idNumber: 999,
        description: 'Task 999',
        section: 'backlog',
        checked: false,
        tags: [],
        mentions: [],
      },
      {
        id: '1000',
        idNumber: 1000,
        description: 'Task 1000',
        section: 'backlog',
        checked: false,
        tags: [],
        mentions: [],
      },
      {
        id: '1234',
        idNumber: 1234,
        description: 'Task 1234',
        section: 'backlog',
        checked: false,
        tags: [],
        mentions: [],
      },
    ];

    const data: TaskData = {
      tasks,
      nextId: 1235,
    };

    const result = formatMarkdown(data);
    expect(result).toContain('id:999');
    expect(result).toContain('id:1000');
    expect(result).toContain('id:1234');
  });
});
