import { Command } from 'commander';
import chalk from 'chalk';
import { moveTask } from '../lib/services/task-service.js';
import { formatId, parseId } from '../lib/utils/id-generator.js';

export function moveCommand(): Command {
  const command = new Command('move');

  command
    .description('Move a task to a different section')
    .argument('<id>', 'task ID (001, #001, or 1)')
    .argument('<section>', 'target section (backlog, todo, progress, closed)')
    .option('-f, --file <file>', 'specify task file (default: TODO.md)')
    .action(async (id, section, options) => {
      try {
        const filePath = options.file;
        await moveTask(filePath, id, section);
        const idNumber = parseId(id);
        const formattedId = formatId(idNumber);
        console.log(chalk.green(`Moved task ${chalk.bold(formattedId)} to ${chalk.bold(section)}`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  return command;
}
