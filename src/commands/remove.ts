import { Command } from 'commander';
import chalk from 'chalk';
import { removeTask } from '../lib/services/task-service.js';
import { formatId, parseId } from '../lib/utils/id-generator.js';

export function removeCommand(): Command {
    const command = new Command('remove');

    command
        .description('Remove a task from the file')
        .argument('<id>', 'task ID (001, #001, or 1)')
        .option('-f, --file <file>', 'specify task file (default: TODO.md)')
        .action(async (id, options) => {
            try {
                const filePath = options.file;
                await removeTask(filePath, id);
                const idNumber = parseId(id);
                const formattedId = formatId(idNumber);
                console.log(chalk.green(`Removed task ${chalk.bold(formattedId)}`));
            } catch (error: any) {
                console.error(chalk.red(`Error: ${error.message}`));
                process.exit(1);
            }
        });

    return command;
}
