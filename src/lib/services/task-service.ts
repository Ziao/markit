import { Task, TaskData, Section, isValidSection } from '../core/task.js';
import { parseMarkdown, parseMetadata } from '../core/parser.js';
import { formatMarkdown, formatEmptyFile } from '../core/formatter.js';
import { readMarkdownFile, writeMarkdownFile, fileExists } from './file-manager.js';
import { parseId } from '../utils/id-generator.js';

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

  // Extract tags and mentions from description (but keep them inline)
  const { tags, mentions } = parseMetadata(description.trim());

  const newIdNumber = data.nextId;
  const newTask: Task = {
    id: String(newIdNumber).padStart(3, '0'),
    idNumber: newIdNumber,
    description: description.trim(), // Keep tags inline in description
    section: 'backlog',
    checked: false,
    tags, // Extract tags for searching
    mentions, // Extract mentions for searching
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

  const task = data.tasks.find((t) => t.idNumber === idNumber);
  if (!task) {
    throw new Error(`Task ${String(idNumber).padStart(3, '0')} not found`);
  }

  task.section = section;
  await saveTasks(filePath, data);
}

export async function markDone(filePath: string | undefined, taskId: string): Promise<void> {
  const data = await loadTasks(filePath);
  const idNumber = parseId(taskId);

  const task = data.tasks.find((t) => t.idNumber === idNumber);
  if (!task) {
    throw new Error(`Task ${String(idNumber).padStart(3, '0')} not found`);
  }

  task.section = 'closed';
  task.checked = true;

  await saveTasks(filePath, data);
}

export async function markWontdo(filePath: string | undefined, taskId: string): Promise<void> {
  const data = await loadTasks(filePath);
  const idNumber = parseId(taskId);

  const task = data.tasks.find((t) => t.idNumber === idNumber);
  if (!task) {
    throw new Error(`Task ${String(idNumber).padStart(3, '0')} not found`);
  }

  task.section = 'closed';
  task.checked = false;

  await saveTasks(filePath, data);
}

export async function removeTask(filePath: string | undefined, taskId: string): Promise<void> {
  const data = await loadTasks(filePath);
  const idNumber = parseId(taskId);

  const index = data.tasks.findIndex((t) => t.idNumber === idNumber);
  if (index === -1) {
    throw new Error(`Task ${String(idNumber).padStart(3, '0')} not found`);
  }

  data.tasks.splice(index, 1);
  await saveTasks(filePath, data);
}

export async function listTasks(filePath: string | undefined, section?: Section, tag?: string, mention?: string): Promise<Task[]> {
  const data = await loadTasks(filePath);

  let filteredTasks = data.tasks;

  if (section) {
    if (!isValidSection(section)) {
      throw new Error(`Invalid section: ${section}. Valid sections: backlog, todo, progress, closed`);
    }
    filteredTasks = filteredTasks.filter((task) => task.section === section);
  }

  if (tag) {
    filteredTasks = filteredTasks.filter((task) => task.tags.includes(tag));
  }

  if (mention) {
    filteredTasks = filteredTasks.filter((task) => task.mentions.includes(mention));
  }

  return filteredTasks;
}

export async function initTaskFile(filePath?: string): Promise<void> {
  const exists = await fileExists(filePath);
  if (exists) {
    throw new Error(`File already exists. Use a different file path or delete the existing file.`);
  }

  const content = formatEmptyFile();
  await writeMarkdownFile(filePath, content);
}
