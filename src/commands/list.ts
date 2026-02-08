import { Command } from 'commander';
import chalk from 'chalk';
import { listTasks } from '../lib/services/task-service.js';
import { Section, FIXED_SECTIONS } from '../lib/core/task.js';
import { formatId } from '../lib/utils/id-generator.js';

export function listCommand(): Command {
    const command = new Command('list');

    command
        .description('List tasks, optionally filtered by section')
        .argument('[section]', 'section to filter by (backlog, todo, progress, closed)')
        .option('-f, --file <file>', 'specify task file (default: TODO.md)')
        .action(async (section, options) => {
            try {
                const filePath = options.file;
                const sectionFilter = section ? (section.toLowerCase() as Section) : undefined;

                if (sectionFilter && !FIXED_SECTIONS.includes(sectionFilter)) {
                    console.error(chalk.red(`Invalid section: ${section}. Valid sections: ${FIXED_SECTIONS.join(', ')}`));
                    process.exit(1);
                    return;
                }

                const tasks = await listTasks(filePath, sectionFilter);

                if (tasks.length === 0) {
                    if (sectionFilter) {
                        console.log(chalk.yellow(`No tasks in ${sectionFilter} section`));
                    } else {
                        console.log(chalk.yellow('No tasks found'));
                    }
                    return;
                }

                // Group by section if no filter
                if (!sectionFilter) {
                    for (const section of FIXED_SECTIONS) {
                        const sectionTasks = tasks.filter(t => t.section === section);
                        if (sectionTasks.length > 0) {
                            console.log(chalk.bold(`\n## ${section}`));
                            for (const task of sectionTasks) {
                                printTask(task);
                            }
                        }
                    }
                } else {
                    // Single section
                    console.log(chalk.bold(`\n## ${sectionFilter}`));
                    for (const task of tasks) {
                        printTask(task);
                    }
                }
            } catch (error: any) {
                console.error(chalk.red(`Error: ${error.message}`));
                process.exit(1);
            }
        });

    return command;
}

function printTask(task: any) {
    const id = formatId(task.idNumber);
    const checkbox = task.checked ? chalk.green('[x]') : chalk.gray('[ ]');
    const status = task.section === 'closed'
        ? (task.checked ? chalk.green('DONE') : chalk.yellow('WONTDO'))
        : '';

    let line = `  ${checkbox} ${chalk.bold(id)} ${task.description}`;

    if (task.tags.length > 0) {
        line += ' ' + task.tags.map((t: string) => chalk.blue(`#${t}`)).join(' ');
    }

    if (task.mentions.length > 0) {
        line += ' ' + task.mentions.map((m: string) => chalk.cyan(`@${m}`)).join(' ');
    }

    if (task.dueDate) {
        line += ' ' + chalk.magenta(`due:${task.dueDate}`);
    }

    if (task.doneDate) {
        line += ' ' + chalk.gray(`_done:${task.doneDate}`);
    }

    if (status) {
        line += ' ' + status;
    }

    console.log(line);
}
