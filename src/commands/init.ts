import { Command } from 'commander';
import chalk from 'chalk';
import { initTaskFile } from '../lib/services/task-service.js';

export function initCommand(): Command {
    const command = new Command('init');

    command
        .alias('i')
        .description('Initialize a new task file with fixed sections')
        .option('-f, --file <file>', 'specify task file (default: TODO.md)')
        .action(async options => {
            try {
                const filePath = options.file;
                await initTaskFile(filePath);
                const fileName = filePath || 'TODO.md';
                console.log(chalk.green(`✓ Created ${fileName} with fixed sections`));
            } catch (error: any) {
                console.error(chalk.red(`Error: ${error.message}`));
                process.exit(1);
            }
        });

    return command;
}
