import { Command } from 'commander';
import chalk from 'chalk';
import { editTask } from '../lib/services/task-service.js';
import { formatId, parseId } from '../lib/utils/id-generator.js';

export function editCommand(): Command {
    const command = new Command('edit');

    command
        .alias('e')
        .description('Edit a task description')
        .argument('<id>', 'task ID (001, #001, or 1)')
        .argument('<description>', 'new task description')
        .option('-f, --file <file>', 'specify task file (default: TODO.md)')
        .action(async (id, description, options) => {
            try {
                const filePath = options.file;
                await editTask(filePath, id, description);
                const idNumber = parseId(id);
                const formattedId = formatId(idNumber);
                console.log(chalk.green(`Updated task ${chalk.bold(formattedId)}`));
            } catch (error: any) {
                console.error(chalk.red(`Error: ${error.message}`));
                process.exit(1);
            }
        });

    return command;
}
