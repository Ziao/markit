import { Task, TaskData, Section, isValidSection } from '../core/task.js';
import { parseMarkdown } from '../core/parser.js';
import { formatMarkdown, formatEmptyFile } from '../core/formatter.js';
import { readMarkdownFile, writeMarkdownFile, fileExists } from './file-manager.js';
import { formatId, parseId } from '../utils/id-generator.js';

export async function loadTasks(filePath?: string): Promise<TaskData> {
    const exists = await fileExists(filePath);
    if (!exists) {
        return { tasks: [], nextId: 1 };
    }

    const content = await readMarkdownFile(filePath);
    try {
        return parseMarkdown(content);
    } catch (error: any) {
        throw new Error(`Failed to parse markdown file: ${error.message}`);
    }
}

export async function saveTasks(filePath: string | undefined, data: TaskData): Promise<void> {
    const content = formatMarkdown(data);
    await writeMarkdownFile(filePath, content);
}

export async function addTask(filePath: string | undefined, description: string): Promise<Task> {
    const data = await loadTasks(filePath);

    const newIdNumber = data.nextId;
    const newTask: Task = {
        id: String(newIdNumber).padStart(3, '0'),
        idNumber: newIdNumber,
        description: description.trim(),
        section: 'backlog',
        checked: false,
        tags: [],
        mentions: [],
    };

    data.tasks.push(newTask);
    data.nextId = newIdNumber + 1;

    await saveTasks(filePath, data);
    return newTask;
}

/**
 * Move a task to a different section
 * @param filePath - Path to the markdown file (optional)
 * @param taskId - Task ID (can be "001", "#001", or "1")
 * @param section - Target section
 * @throws Error if task not found or invalid section
 */
export async function moveTask(filePath: string | undefined, taskId: string, section: string): Promise<void> {
    if (!isValidSection(section)) {
        throw new Error(`Invalid section: ${section}. Valid sections: backlog, todo, progress, closed`);
    }

    const data = await loadTasks(filePath);
    const idNumber = parseId(taskId);

    const task = data.tasks.find(t => t.idNumber === idNumber);
    if (!task) {
        throw new Error(`Task #${formatId(idNumber)} not found`);
    }

    task.section = section;
    await saveTasks(filePath, data);
}

export async function markDone(filePath: string | undefined, taskId: string): Promise<void> {
    const data = await loadTasks(filePath);
    const idNumber = parseId(taskId);

    const task = data.tasks.find(t => t.idNumber === idNumber);
    if (!task) {
        throw new Error(`Task #${formatId(idNumber)} not found`);
    }

    task.section = 'closed';
    task.checked = true;
    task.doneDate = new Date().toISOString().split('T')[0];

    await saveTasks(filePath, data);
}

export async function markWontdo(filePath: string | undefined, taskId: string): Promise<void> {
    const data = await loadTasks(filePath);
    const idNumber = parseId(taskId);

    const task = data.tasks.find(t => t.idNumber === idNumber);
    if (!task) {
        throw new Error(`Task #${formatId(idNumber)} not found`);
    }

    task.section = 'closed';
    task.checked = false;

    await saveTasks(filePath, data);
}

export async function removeTask(filePath: string | undefined, taskId: string): Promise<void> {
    const data = await loadTasks(filePath);
    const idNumber = parseId(taskId);

    const index = data.tasks.findIndex(t => t.idNumber === idNumber);
    if (index === -1) {
        throw new Error(`Task #${formatId(idNumber)} not found`);
    }

    data.tasks.splice(index, 1);
    await saveTasks(filePath, data);
}

export async function listTasks(filePath: string | undefined, section?: Section): Promise<Task[]> {
    const data = await loadTasks(filePath);

    if (section) {
        if (!isValidSection(section)) {
            throw new Error(`Invalid section: ${section}. Valid sections: backlog, todo, progress, closed`);
        }
        return data.tasks.filter(task => task.section === section);
    }

    return data.tasks;
}

export async function initTaskFile(filePath?: string): Promise<void> {
    const exists = await fileExists(filePath);
    if (exists) {
        throw new Error(`File already exists. Use a different file path or delete the existing file.`);
    }

    const content = formatEmptyFile();
    await writeMarkdownFile(filePath, content);
}
