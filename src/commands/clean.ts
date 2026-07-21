import { Command } from 'commander';
import chalk from 'chalk';
import { cleanTaskFile } from '../lib/services/task-service.js';
import { getFilePath } from '../lib/services/file-manager.js';

export function cleanCommand(): Command {
    const command = new Command('clean');

    command
        .alias('c')
        .description('Reformat the task file (normalize structure and sort tasks by ID)')
        .option('-f, --file <file>', 'specify task file (default: TODO.md)')
        .action(async options => {
            try {
                const filePath = options.file;
                await cleanTaskFile(filePath);
                console.log(chalk.green(`Cleaned ${chalk.bold(getFilePath(filePath))}`));
            } catch (error: any) {
                console.error(chalk.red(`Error: ${error.message}`));
                process.exit(1);
            }
        });

    return command;
}
