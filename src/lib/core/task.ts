export type Section = 'backlog' | 'todo' | 'progress' | 'closed';

export interface Task {
    id: string;
    idNumber: number;
    description: string;
    section: Section;
    checked: boolean;
    tags: string[];
    mentions: string[];
    dueDate?: string;
    doneDate?: string;
    lineNumber?: number;
}

export interface TaskData {
    tasks: Task[];
    nextId: number;
}

export const FIXED_SECTIONS: Section[] = ['backlog', 'todo', 'progress', 'closed'];

export function isValidSection(section: string): section is Section {
    return FIXED_SECTIONS.includes(section as Section);
}
