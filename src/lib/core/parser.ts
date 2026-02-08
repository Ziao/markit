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
        const descriptionWithMetadata = restOfLine.replace(/id:\d+\s*/, '').trim();
        const { description, tags, mentions, dueDate } = parseMetadata(descriptionWithMetadata);
        const task: Task = {
            id: String(idNumber).padStart(3, '0'),
            idNumber,
            description,
            section: currentSection,
            checked,
            tags,
            mentions,
            dueDate,
            lineNumber,
        };

        tasks.push(task);
    }

    const nextId = getNextId(existingIds);
    return { tasks, nextId };
}

export function parseMetadata(line: string): {
    description: string;
    tags: string[];
    mentions: string[];
    dueDate?: string;
} {
    const tags: string[] = [];
    const mentions: string[] = [];
    let dueDate: string | undefined;

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

    // Remove only metadata that should be extracted (due dates)
    // Keep tags and mentions inline in description - they stay where they are
    let description = line
        .replace(/due:\d{4}-\d{2}-\d{2}/g, '')
        .trim()
        .replace(/\s+/g, ' ');

    // Remove duplicate mentions from description (keep first occurrence of each)
    const seenMentions = new Set<string>();
    for (const mention of mentions) {
        if (seenMentions.has(mention)) {
            // Remove all but the first occurrence of this mention
            let firstOccurrence = true;
            description = description.replace(new RegExp(`@${mention}\\b`, 'g'), match => {
                if (firstOccurrence) {
                    firstOccurrence = false;
                    return match; // Keep first occurrence
                }
                return ''; // Remove duplicate
            });
        } else {
            seenMentions.add(mention);
        }
    }
    // Clean up extra spaces
    description = description.replace(/\s+/g, ' ').trim();

    return { description, tags, mentions, dueDate };
}
