import { Command } from 'commander';
import chalk from 'chalk';
import { markDone } from '../lib/services/task-service.js';
import { formatId, parseId } from '../lib/utils/id-generator.js';

export function doneCommand(): Command {
    const command = new Command('done');

    command
        .description('Mark a task as done (moves to closed section)')
        .argument('<id>', 'task ID (001, #001, or 1)')
        .option('-f, --file <file>', 'specify task file (default: TODO.md)')
        .action(async (id, options) => {
            try {
                const filePath = options.file;
                await markDone(filePath, id);
                const idNumber = parseId(id);
                const formattedId = formatId(idNumber);
                console.log(chalk.green(`Task ${chalk.bold(formattedId)} marked as done`));
            } catch (error: any) {
                console.error(chalk.red(`Error: ${error.message}`));
                process.exit(1);
            }
        });

    return command;
}
