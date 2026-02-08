import { Command } from 'commander';
import chalk from 'chalk';
import { listTasks } from '../lib/services/task-service.js';
import { Section, FIXED_SECTIONS } from '../lib/core/task.js';
import { formatId } from '../lib/utils/id-generator.js';

export function listCommand(): Command {
    const command = new Command('list');

    command
        .alias('l')
        .description('List tasks, optionally filtered by section, tag, or mention')
        .argument('[filter]', 'section (backlog, todo, progress, closed), tag (#tag), or mention (@user) to filter by')
        .option('-f, --file <file>', 'specify task file (default: TODO.md)')
        .action(async (filter, options) => {
            try {
                const filePath = options.file;
                let sectionFilter: Section | undefined;
                let tagFilter: string | undefined;
                let mentionFilter: string | undefined;

                if (filter) {
                    if (filter.startsWith('#')) {
                        // Tag filter: #urgent
                        tagFilter = filter.slice(1);
                    } else if (filter.startsWith('@')) {
                        // Mention filter: @ziao
                        mentionFilter = filter.slice(1);
                    } else {
                        // Section filter
                        const section = filter.toLowerCase() as Section;
                        if (!FIXED_SECTIONS.includes(section)) {
                            console.error(
                                chalk.red(`Invalid section: ${filter}. Valid sections: ${FIXED_SECTIONS.join(', ')}`)
                            );
                            process.exit(1);
                            return;
                        }
                        sectionFilter = section;
                    }
                }

                const tasks = await listTasks(filePath, sectionFilter, tagFilter, mentionFilter);

                if (tasks.length === 0) {
                    if (tagFilter) {
                        console.log(chalk.yellow(`No tasks found with tag #${tagFilter}`));
                    } else if (mentionFilter) {
                        console.log(chalk.yellow(`No tasks found mentioning @${mentionFilter}`));
                    } else if (sectionFilter) {
                        console.log(chalk.yellow(`No tasks in ${sectionFilter} section`));
                    } else {
                        console.log(chalk.yellow('No tasks found'));
                    }
                    return;
                }

                // Group by section if no section filter (but tag filter may be active)
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
    const status = task.section === 'closed' ? (task.checked ? chalk.green('DONE') : chalk.yellow('WONTDO')) : '';

    // Color tags inline in description
    let description = task.description;
    for (const tag of task.tags) {
        const tagPattern = new RegExp(`#${tag}\\b`, 'g');
        description = description.replace(tagPattern, chalk.blue(`#${tag}`));
    }

    // Color mentions inline in description
    for (const mention of task.mentions) {
        const mentionPattern = new RegExp(`@${mention}\\b`, 'g');
        description = description.replace(mentionPattern, chalk.cyan(`@${mention}`));
    }

    let line = `  ${checkbox} ${chalk.bold(id)} ${description}`;

    // Add due date after description (mentions already colored inline)
    if (task.dueDate) {
        line += ' ' + chalk.magenta(`due:${task.dueDate}`);
    }

    if (status) {
        line += ' ' + status;
    }

    console.log(line);
}
