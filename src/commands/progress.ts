import { Command } from 'commander';
import chalk from 'chalk';
import { moveTask } from '../lib/services/task-service.js';
import { formatId, parseId } from '../lib/utils/id-generator.js';

export function progressCommand(): Command {
    const command = new Command('progress');

    command
        .description('Move a task to progress section (shortcut for: move <id> progress)')
        .argument('<id>', 'task ID (001, #001, or 1)')
        .option('-f, --file <file>', 'specify task file (default: TODO.md)')
        .action(async (id, options) => {
            try {
                const filePath = options.file;
                await moveTask(filePath, id, 'progress');
                const idNumber = parseId(id);
                const formattedId = formatId(idNumber);
                console.log(chalk.green(`Moved task ${chalk.bold(formattedId)} to ${chalk.bold('progress')}`));
            } catch (error: any) {
                console.error(chalk.red(`Error: ${error.message}`));
                process.exit(1);
            }
        });

    return command;
}
