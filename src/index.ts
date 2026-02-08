#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initCommand } from './commands/init.js';
import { addCommand } from './commands/add.js';
import { listCommand } from './commands/list.js';
import { moveCommand } from './commands/move.js';
import { progressCommand } from './commands/progress.js';
import { doneCommand } from './commands/done.js';
import { wontdoCommand } from './commands/wontdo.js';
import { removeCommand } from './commands/remove.js';
import { syncCommand } from './commands/sync.js';

// Get version from package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;

const program = new Command();

program
  .name('markit')
  .description('A CLI task manager that stores tasks in markdown files')
  .version(version);

program.addCommand(initCommand());
program.addCommand(addCommand());
program.addCommand(listCommand());
program.addCommand(moveCommand());
program.addCommand(progressCommand());
program.addCommand(doneCommand());
program.addCommand(wontdoCommand());
program.addCommand(removeCommand());
program.addCommand(syncCommand());

program.configureOutput({
  writeErr: (str) => {
    process.stderr.write(chalk.red(str));
  }
});

program.parse();
