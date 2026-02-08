# @ziao/markit

A CLI task manager that stores tasks in human-editable markdown files. Manage your tasks through simple commands without ever needing to open the markdown file directly.

## Features

- **Simple CLI interface** - Manage tasks with intuitive commands
- **Markdown storage** - Tasks stored in readable `TODO.md` files
- **Sequential IDs** - Tasks numbered #001, #002, #003, etc.
- **Fixed workflow** - backlog → todo → progress → closed
- **Multi-file support** - Use `-f` flag to manage different task files
- **Git-friendly** - Markdown format works perfectly with version control

## Installation

```bash
npm install -g @ziao/markit
```

Or use locally in your project:

```bash
npm install @ziao/markit
npx markit init
```

## Quick Start

```bash
# Initialize a new task file
markit init

# Add a task
markit add "Fix login bug"

# List all tasks
markit list

# Move task to progress
markit move 001 progress

# Mark as done
markit done 001

# Or mark as wontdo
markit wontdo 002
```

## Commands

### `markit init [-f <file>]`

Create a new task file with fixed sections.

```bash
markit init
markit init -f work.md
```

### `markit add "description" [-f <file>]`

Add a new task to the backlog section.

```bash
markit add "Fix login bug"
markit add "Write tests" -f work.md
```

### `markit list [section] [-f <file>]`

List tasks, optionally filtered by section.

```bash
markit list                    # All tasks
markit list backlog            # Only backlog
markit list progress -f work.md
```

### `markit move <id> <section> [-f <file>]`

Move a task between sections (backlog, todo, progress, closed).

```bash
markit move 001 todo
markit move 001 progress
```

### `markit done <id> [-f <file>]`

Mark a task as done (moves to closed with checkbox [x]).

```bash
markit done 001
markit done #001              # # prefix optional
```

### `markit wontdo <id> [-f <file>]`

Mark a task as wontdo (moves to closed with checkbox [ ]).

```bash
markit wontdo 002
```

### `markit remove <id> [-f <file>]`

Remove a task from the file.

```bash
markit remove 001
```

## Task File Format

Tasks are stored in markdown files with fixed sections:

```markdown
# Tasks

## backlog
- [ ] id:#001 Fix login bug #bug #urgent @john due:2025-01-15
- [ ] id:#002 Write API documentation #docs

## todo
- [ ] id:#003 Add dark mode #feature

## progress
- [ ] id:#004 Refactor auth module #refactor

## closed
- [x] id:#005 Setup CI/CD pipeline #devops _done:2025-01-10
- [ ] id:#006 Old feature idea #feature
```

### Sections

- **backlog** - New tasks start here
- **todo** - Tasks ready to work on
- **progress** - Tasks currently in progress
- **closed** - Completed (done) or cancelled (wontdo)
  - `[x]` = DONE (completed successfully)
  - `[ ]` = WONTDO (cancelled/abandoned)

### Task IDs

- Sequential numbering: #001, #002, #003, etc.
- IDs are never reused (even if tasks are deleted)
- CLI accepts: `001`, `#001`, or `1` (all work)

### Metadata

- **Tags**: `#tag1 #tag2`
- **Mentions**: `@username`
- **Due dates**: `due:YYYY-MM-DD`
- **Done date**: `_done:YYYY-MM-DD` (auto-added when marked done)

## Multi-File Support

Use the `-f` flag to manage different task files:

```bash
# Work tasks
markit add "Fix bug" -f work.md
markit list -f work.md

# Personal tasks
markit add "Buy groceries" -f personal.md
markit done 001 -f personal.md
```

## Workflow Example

```bash
# 1. Initialize
markit init

# 2. Add tasks
markit add "Fix login bug"
markit add "Write tests"
markit add "Update docs"

# 3. Move to todo (ready to work on)
markit move 001 todo

# 4. Start working (move to progress)
markit move 001 progress

# 5. Complete it
markit done 001

# 6. Cancel a task
markit wontdo 003

# 7. View status
markit list
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Architecture

The codebase is structured in layers to support future GUI/API:

- **Core Layer** (`src/lib/core/`) - Pure business logic (framework-agnostic)
- **Service Layer** (`src/lib/services/`) - File operations and task management (reusable by API)
- **CLI Layer** (`src/commands/`) - Commander.js commands

This architecture allows a future GUI to use the same Service Layer without duplicating logic.

## License

MIT
