import { Task, TaskData, Section, FIXED_SECTIONS } from './task.js';
import { extractIdFromLine, getNextId } from '../utils/id-generator.js';

export function parseMarkdown(markdown: string): TaskData {
    const lines = markdown.split('\n');
    const tasks: Task[] = [];
    const existingIds: number[] = [];
    let currentSection: Section | null = null;
    let lineNumber = 0;

    for (const line of lines) {
        lineNumber++;
        const trimmed = line.trim();

        if (trimmed.startsWith('## ')) {
            const sectionName = trimmed.slice(3).trim().toLowerCase();
            if (FIXED_SECTIONS.includes(sectionName as Section)) {
                currentSection = sectionName as Section;
            }
            continue;
        }

        if (!trimmed || !trimmed.startsWith('- [')) {
            continue;
        }

        const checkboxMatch = trimmed.match(/^-\s+\[([ x])\]/);
        if (!checkboxMatch) {
            continue;
        }

        const checked = checkboxMatch[1] === 'x';
        const restOfLine = trimmed.slice(checkboxMatch[0].length).trim();

        const idNumber = extractIdFromLine(restOfLine);
        if (!idNumber) {
            continue;
        }

        if (!currentSection) {
            continue;
        }

        existingIds.push(idNumber);
        const descriptionWithMetadata = restOfLine.replace(/id:#?\d+\s*/, '').trim();
        const { description, tags, mentions, dueDate, doneDate } = parseMetadata(descriptionWithMetadata);
        const task: Task = {
            id: String(idNumber).padStart(3, '0'),
            idNumber,
            description,
            section: currentSection,
            checked,
            tags,
            mentions,
            dueDate,
            doneDate,
            lineNumber
        };

        tasks.push(task);
    }

    const nextId = getNextId(existingIds);
    return { tasks, nextId };
}

function parseMetadata(line: string): {
    description: string;
    tags: string[];
    mentions: string[];
    dueDate?: string;
    doneDate?: string;
} {
    const tags: string[] = [];
    const mentions: string[] = [];
    let dueDate: string | undefined;
    let doneDate: string | undefined;

    const tagRegex = /#(\w+)/g;
    let match;
    while ((match = tagRegex.exec(line)) !== null) {
        tags.push(match[1]);
    }

    const mentionRegex = /@(\w+)/g;
    while ((match = mentionRegex.exec(line)) !== null) {
        mentions.push(match[1]);
    }

    const dueMatch = line.match(/due:(\d{4}-\d{2}-\d{2})/);
    if (dueMatch) {
        dueDate = dueMatch[1];
    }

    const doneMatch = line.match(/_done:(\d{4}-\d{2}-\d{2})/);
    if (doneMatch) {
        doneDate = doneMatch[1];
    }

    let description = line
        .replace(/#\w+/g, '')
        .replace(/@\w+/g, '')
        .replace(/due:\d{4}-\d{2}-\d{2}/g, '')
        .replace(/_done:\d{4}-\d{2}-\d{2}/g, '')
        .trim()
        .replace(/\s+/g, ' ');

    return { description, tags, mentions, dueDate, doneDate };
}
