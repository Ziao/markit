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

After installation, you can use either `markit` or the shorter `mi` command:

```bash
markit init
# or
mi init
```

Or use locally in your project:

```bash
npm install @ziao/markit
npx markit init
# or
npx mi init
```

## Quick Start

```bash
# Initialize a new task file
mi init

# Add a task
mi a "Fix login bug"

# List all tasks
mi l

# Move task to progress
mi p 001

# Mark as done
mi d 001

# Or mark as wontdo
mi w 002
```

> **Tip**: Use `mi` instead of `markit` for faster typing. All examples work with both `markit` and `mi`.

## Commands

All commands have single-letter aliases for faster typing.

### `markit init [-f <file>]` (alias: `i`)

Create a new task file with fixed sections.

```bash
markit init
markit i -f work.md
```

### `markit add "description" [-f <file>]` (alias: `a`)

Add a new task to the backlog section.

```bash
markit add "Fix login bug"
markit a "Write tests" -f work.md
```

### `markit list [filter] [-f <file>]` (alias: `l`)

List tasks, optionally filtered by section, tag, or mention.

```bash
markit list                    # All tasks
markit l backlog              # Only backlog section
markit l #urgent              # Tasks with #urgent tag
markit l @ziao                # Tasks mentioning @ziao
markit l progress -f work.md  # Progress section in work.md
markit l #bug -f work.md      # Tasks with #bug tag in work.md
markit l @john -f work.md     # Tasks mentioning @john in work.md
```

### `markit move <id> <section> [-f <file>]` (alias: `m`)

Move a task between sections (backlog, todo, progress, closed).

```bash
markit move 001 todo
markit m 001 progress
```

### `markit progress <id> [-f <file>]` (alias: `p`)

Move a task to progress section (shortcut for `move <id> progress`).

```bash
markit progress 001
markit p 001 -f work.md
```

### `markit done <id> [-f <file>]` (alias: `d`)

Mark a task as done (moves to closed with checkbox [x]).

```bash
markit done 001
markit d #001              # # prefix optional
```

### `markit wontdo <id> [-f <file>]` (alias: `w`)

Mark a task as wontdo (moves to closed with checkbox [ ]).

```bash
markit wontdo 002
markit w 002
```

### `markit remove <id> [-f <file>]` (alias: `r`)

Remove a task from the file.

```bash
markit remove 001
markit r 001
```

### `markit sync [-f <file>]` (alias: `s`)

Sync manually edited tasks. This command:
- Assigns IDs to tasks without IDs
- Moves checked tasks in progress/backlog/todo to done
- Adds checkboxes to tasks that don't have them

Useful after manually editing the markdown file.

```bash
markit sync
markit s -f work.md
```

## Task File Format

Tasks are stored in markdown files with fixed sections:

```markdown
# Tasks

## backlog
- [ ] id:001 Fix login bug #bug #urgent @john due:2025-01-15
- [ ] id:002 Write API documentation #docs

## todo
- [ ] id:003 Add dark mode #feature

## progress
- [ ] id:004 Refactor auth module #refactor

## closed
- [x] id:005 Setup CI/CD pipeline #devops
- [ ] id:006 Old feature idea #feature
```

### Sections

- **backlog** - New tasks start here
- **todo** - Tasks ready to work on
- **progress** - Tasks currently in progress
- **closed** - Completed (done) or cancelled (wontdo)
  - `[x]` = DONE (completed successfully)
  - `[ ]` = WONTDO (cancelled/abandoned)

### Task IDs

- Sequential numbering: 001, 002, 003, etc.
- Stored in file as: `id:001`, `id:002`, `id:003`
- IDs are never reused (even if tasks are deleted)
- CLI accepts: `001`, `#001`, or `1` (all work - the # is optional for convenience)

### Metadata

- **Tags**: `#tag1 #tag2`
- **Mentions**: `@username`
- **Due dates**: `due:YYYY-MM-DD`

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
markit a "Write tests"
markit a "Update docs"

# 3. Move to todo (ready to work on)
markit m 001 todo

# 4. Start working (move to progress)
markit p 001

# 5. Complete it
markit d 001

# 6. Cancel a task
markit w 003

# 7. View status
markit l
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode - rebuilds automatically on file changes
npm run dev

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode for tests
npm run test:watch
```

### Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint. Commit messages must follow this format:

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes that don't modify src or test files
- `revert`: Revert a previous commit

**Examples:**
```bash
git commit -m "feat: add progress command shortcut"
git commit -m "fix: handle tasks without IDs in sync"
git commit -m "docs: update README with aliases"
```

### Version Bumping

This project uses `standard-version` to automatically bump version numbers based on conventional commits:

- `feat:` commits → **minor** version bump (0.1.0 → 0.2.0)
- `fix:` commits → **patch** version bump (0.1.0 → 0.1.1)
- `BREAKING CHANGE:` or `feat!:` → **major** version bump (0.1.0 → 1.0.0)

**Release workflow:**
```bash
# Automatic version bump based on commits since last release
npm run release

# Or manually specify version type
npm run release:patch   # 0.1.0 → 0.1.1
npm run release:minor   # 0.1.0 → 0.2.0
npm run release:major   # 0.1.0 → 1.0.0
```

This will:
1. Bump version in `package.json`
2. Generate/update `CHANGELOG.md` from commit history
3. Create a git tag
4. Commit the changes

After running `npm run release`, push with tags:
```bash
git push --follow-tags
```

## Architecture

The codebase is structured in layers to support future GUI/API:

- **Core Layer** (`src/lib/core/`) - Pure business logic (framework-agnostic)
- **Service Layer** (`src/lib/services/`) - File operations and task management (reusable by API)
- **CLI Layer** (`src/commands/`) - Commander.js commands

This architecture allows a future GUI to use the same Service Layer without duplicating logic.

## License

MIT
