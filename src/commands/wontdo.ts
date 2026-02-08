import { Command } from 'commander';
import chalk from 'chalk';
import { markWontdo } from '../lib/services/task-service.js';
import { formatId, parseId } from '../lib/utils/id-generator.js';

export function wontdoCommand(): Command {
  const command = new Command('wontdo');

  command
    .alias('w')
    .description('Mark a task as wontdo (moves to closed section)')
    .argument('<id>', 'task ID (001, #001, or 1)')
    .option('-f, --file <file>', 'specify task file (default: TODO.md)')
    .action(async (id, options) => {
      try {
        const filePath = options.file;
        await markWontdo(filePath, id);
        const idNumber = parseId(id);
        const formattedId = formatId(idNumber);
        console.log(chalk.yellow(`Task ${chalk.bold(formattedId)} marked as wontdo`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  return command;
}
