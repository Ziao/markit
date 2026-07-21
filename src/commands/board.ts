import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { listTasks } from '../lib/services/task-service.js';
import { Section, FIXED_SECTIONS } from '../lib/core/task.js';
import { formatId } from '../lib/utils/id-generator.js';
import { Task } from '../lib/core/task.js';

export function boardCommand(): Command {
    const command = new Command('board');

    command
        .alias('b')
        .description('Display tasks in a board/table view (sections as columns)')
        .option('-f, --file <file>', 'specify task file (default: TODO.md)')
        .action(async options => {
            try {
                const filePath = options.file;
                const tasks = await listTasks(filePath);

                if (tasks.length === 0) {
                    console.log(chalk.yellow('No tasks found'));
                    return;
                }

                // Always show table format for board command
                printTasksAsTable(tasks);
            } catch (error: any) {
                console.error(chalk.red(`Error: ${error.message}`));
                process.exit(1);
            }
        });

    return command;
}

function printTasksAsTable(tasks: Task[]) {
    // Group tasks by section
    const tasksBySection: Record<Section, Task[]> = {
        backlog: [],
        todo: [],
        progress: [],
        closed: [],
    };

    for (const task of tasks) {
        tasksBySection[task.section].push(task);
    }

    // Calculate max rows needed (max tasks in any section)
    const maxRows = Math.max(...Object.values(tasksBySection).map(t => t.length));

    if (maxRows === 0) {
        return;
    }

    // Calculate column widths - each column gets 1/4 of terminal width
    const terminalWidth = process.stdout.columns || 80;
    const charsPerColumn = Math.floor(terminalWidth / 4);

    // Create table with headers and column widths
    const table = new Table({
        head: FIXED_SECTIONS.map(s => s.toUpperCase()),
        colWidths: [charsPerColumn, charsPerColumn, charsPerColumn, charsPerColumn],
        style: {
            head: ['cyan'],
            border: ['gray'],
        },
    });

    // Build rows - each row represents a position across all sections
    for (let i = 0; i < maxRows; i++) {
        const row: string[] = [];

        for (const sectionName of FIXED_SECTIONS) {
            const sectionTasks = tasksBySection[sectionName];
            if (i < sectionTasks.length) {
                const task = sectionTasks[i];
                const id = formatId(task.idNumber);
                const checkbox = task.checked ? chalk.green('[x]') : chalk.gray('[ ]');

                // Format description with truncation based on column width
                // Reserve space for checkbox, ID, and some padding
                const reservedSpace = 10; // "[ ] 001 " = ~8 chars
                const maxDescLength = Math.max(15, charsPerColumn - reservedSpace);

                let description = task.description;
                if (description.length > maxDescLength) {
                    description = description.substring(0, maxDescLength - 3) + '...';
                }

                // Color tags inline in description
                for (const tag of task.tags) {
                    const tagPattern = new RegExp(`#${tag}\\b`, 'g');
                    description = description.replace(tagPattern, chalk.blue(`#${tag}`));
                }

                // Color mentions inline in description
                for (const mention of task.mentions) {
                    const mentionPattern = new RegExp(`@${mention}\\b`, 'g');
                    description = description.replace(mentionPattern, chalk.cyan(`@${mention}`));
                }

                // Add due date if present
                const due = task.dueDate ? ' ' + chalk.magenta(`due:${task.dueDate}`) : '';

                let fullText = `${checkbox} ${chalk.bold(id)} ${description}${due}`;

                // Truncate to fit column width (accounting for ANSI color codes)
                const plainText = fullText.replace(/\u001b\[[0-9;]*m/g, '');
                if (plainText.length > charsPerColumn) {
                    // Truncate plain text and re-apply colors to truncated portion
                    const truncated = plainText.substring(0, charsPerColumn - 3) + '...';
                    // Re-apply colors by finding color codes in original and applying to truncated
                    // For simplicity, just truncate the plain text version
                    fullText = truncated;
                }

                row.push(fullText);
            } else {
                row.push('');
            }
        }

        table.push(row);
    }

    console.log(table.toString());
}
