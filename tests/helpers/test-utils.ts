/**
 * Test utilities and helpers
 */

import { Volume } from 'memfs';
import { createFsFromVolume } from 'memfs';
import { fs } from 'memfs';

/**
 * Create a mock file system for testing
 */
export function createMockFs(): typeof fs {
  const volume = Volume.fromJSON({});
  return createFsFromVolume(volume) as typeof fs;
}

/**
 * Sample markdown content for testing
 */
export const SAMPLE_TODO_MD = `# Tasks

## backlog
- [ ] id:#001 Fix login bug #bug #urgent @john due:2025-01-15
- [ ] id:#002 Write API documentation #docs

## todo
- [ ] id:#003 Add dark mode #feature

## progress
- [ ] id:#004 Refactor auth module #refactor

## closed
- [x] id:#005 Setup CI/CD pipeline #devops _done:2025-01-10
- [x] id:#006 Deploy v1.0 #release _done:2025-01-08
- [ ] id:#007 Old feature idea #feature
`;

/**
 * Empty markdown file structure
 */
export const EMPTY_TODO_MD = `# Tasks

## backlog

## todo

## progress

## closed
`;
