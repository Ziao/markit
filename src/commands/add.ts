import { Command } from 'commander';
import chalk from 'chalk';
import { addTask } from '../lib/services/task-service.js';
import { formatId } from '../lib/utils/id-generator.js';

export function addCommand(): Command {
  const command = new Command('add');

  command
    .description('Add a new task to backlog')
    .argument('<description>', 'task description')
    .option('-f, --file <file>', 'specify task file (default: TODO.md)')
    .action(async (description, options) => {
      try {
        const filePath = options.file;
        const task = await addTask(filePath, description);
        const id = formatId(task.idNumber);
        console.log(chalk.green(`Added task ${chalk.bold(id)} to backlog`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  return command;
}
