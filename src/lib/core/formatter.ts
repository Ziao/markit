import { Task, TaskData, FIXED_SECTIONS } from './task.js';
import { formatId } from '../utils/id-generator.js';

export function formatMarkdown(data: TaskData): string {
    const lines: string[] = [];
    lines.push('# Tasks');
    lines.push('');

    for (const section of FIXED_SECTIONS) {
        const sectionTasks = data.tasks.filter(task => task.section === section);
        lines.push(`## ${section}`);

        if (sectionTasks.length === 0) {
            lines.push('');
        } else {
            const sortedTasks = [...sectionTasks].sort((a, b) => a.idNumber - b.idNumber);
            for (const task of sortedTasks) {
                lines.push(formatTaskLine(task));
            }
            lines.push('');
        }
    }

    return lines.join('\n');
}

function formatTaskLine(task: Task): string {
    const parts: string[] = [];
    const checkbox = task.checked ? '[x]' : '[ ]';
    parts.push(`- ${checkbox}`);
    parts.push(`id:${formatId(task.idNumber)}`);
    parts.push(task.description);

    for (const tag of task.tags) {
        parts.push(`#${tag}`);
    }

    for (const mention of task.mentions) {
        parts.push(`@${mention}`);
    }

    if (task.dueDate) {
        parts.push(`due:${task.dueDate}`);
    }

    if (task.doneDate) {
        parts.push(`_done:${task.doneDate}`);
    }

    return parts.join(' ');
}

export function formatEmptyFile(): string {
    const lines: string[] = [];
    lines.push('# Tasks');
    lines.push('');

    for (const section of FIXED_SECTIONS) {
        lines.push(`## ${section}`);
        lines.push('');
    }

    return lines.join('\n');
}
