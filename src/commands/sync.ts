import { Command } from 'commander';
import chalk from 'chalk';
import { loadTasks, markDone } from '../lib/services/task-service.js';
import { formatId, extractIdFromLine } from '../lib/utils/id-generator.js';
import { readMarkdownFile, writeMarkdownFile } from '../lib/services/file-manager.js';
import { FIXED_SECTIONS } from '../lib/core/task.js';

export function syncCommand(): Command {
  const command = new Command('sync');

  command
    .alias('s')
    .description('Sync manually edited tasks (assigns IDs to tasks without IDs, moves checked tasks to done)')
    .option('-f, --file <file>', 'specify task file (default: TODO.md)')
    .action(async (options) => {
      try {
        const filePath = options.file;
        
        // Read raw markdown to find tasks without IDs
        const rawContent = await readMarkdownFile(filePath);
        const lines = rawContent.split('\n');
        
        // First, load existing tasks to get next ID
        const data = await loadTasks(filePath);
        let nextId = data.nextId;
        let idAssignedCount = 0;
        const assignedIds: string[] = [];
        
        // Process lines to assign IDs to tasks without them
        const updatedLines: string[] = [];
        let currentSection: string | null = null;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const trimmed = line.trim();
          
          // Check for section headers
          if (trimmed.startsWith('## ')) {
            const sectionName = trimmed.slice(3).trim().toLowerCase();
            if (FIXED_SECTIONS.includes(sectionName as any)) {
              currentSection = sectionName;
            }
            updatedLines.push(line);
            continue;
          }
          
          // Check if this is a task line (with or without checkbox)
          if (trimmed.startsWith('- ')) {
            const checkboxMatch = trimmed.match(/^-\s+\[([ x])\]/);
            let restOfLine: string;
            let hasCheckbox = false;
            
            if (checkboxMatch) {
              // Has checkbox: - [ ] or - [x]
              hasCheckbox = true;
              restOfLine = trimmed.slice(checkboxMatch[0].length).trim();
            } else {
              // Plain list item: - task description
              restOfLine = trimmed.slice(2).trim();
            }
            
            // Check if task has an ID
            const existingId = extractIdFromLine(restOfLine);
            
            if (!existingId && currentSection) {
              // Task without ID - assign one
              const idString = formatId(nextId);
              
              if (hasCheckbox) {
                // Has checkbox, add ID after checkbox
                const newLine = line.replace(
                  /^(\s*-\s+\[[ x]\])\s*/,
                  `$1 id:${idString} `
                );
                updatedLines.push(newLine);
              } else {
                // No checkbox, add checkbox and ID
                const indent = line.match(/^(\s*)/)?.[1] || '';
                const newLine = `${indent}- [ ] id:${idString} ${restOfLine}`;
                updatedLines.push(newLine);
              }
              
              idAssignedCount++;
              assignedIds.push(idString);
              nextId++;
            } else {
              // Task already has ID
              updatedLines.push(line);
            }
          } else {
            updatedLines.push(line);
          }
        }
        
        // Write updated content if IDs were assigned
        if (idAssignedCount > 0) {
          await writeMarkdownFile(filePath, updatedLines.join('\n'));
        }
        
        // Now reload and check for checked tasks that need to be moved
        const dataAfterIdAssignment = await loadTasks(filePath);
        let movedCount = 0;
        const movedTasks: string[] = [];

        // Find checked tasks in backlog/todo/progress sections → move to done
        for (const task of dataAfterIdAssignment.tasks) {
          if (task.checked && (task.section === 'backlog' || task.section === 'todo' || task.section === 'progress')) {
            // Task is checked but not in closed section - move to done
            await markDone(filePath, task.id);
            movedCount++;
            movedTasks.push(formatId(task.idNumber));
          }
        }

        // Report results
        const messages: string[] = [];
        if (idAssignedCount > 0) {
          messages.push(`Assigned IDs to ${idAssignedCount} task(s): ${assignedIds.join(', ')}`);
        }
        if (movedCount > 0) {
          messages.push(`Moved ${movedCount} task(s) to done: ${movedTasks.join(', ')}`);
        }
        
        if (messages.length === 0) {
          console.log(chalk.green('✓ All tasks are in sync'));
        } else {
          for (const msg of messages) {
            console.log(chalk.green(`✓ ${msg}`));
          }
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  return command;
}
