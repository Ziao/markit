import { describe, it, expect } from 'vitest';
import { formatId, parseId, extractIdFromLine, getNextId } from '../../src/lib/utils/id-generator.js';

describe('ID Generator', () => {
  describe('formatId', () => {
    it('should format ID with zero padding', () => {
      expect(formatId(1)).toBe('#001');
      expect(formatId(2)).toBe('#002');
      expect(formatId(10)).toBe('#010');
      expect(formatId(100)).toBe('#100');
    });

    it('should throw error for invalid ID', () => {
      expect(() => formatId(0)).toThrow('ID number must be >= 1');
      expect(() => formatId(-1)).toThrow('ID number must be >= 1');
    });
  });

  describe('parseId', () => {
    it('should parse ID with # prefix', () => {
      expect(parseId('#001')).toBe(1);
      expect(parseId('#002')).toBe(2);
      expect(parseId('#100')).toBe(100);
    });

    it('should parse ID without # prefix', () => {
      expect(parseId('001')).toBe(1);
      expect(parseId('002')).toBe(2);
      expect(parseId('100')).toBe(100);
    });

    it('should parse ID as single number', () => {
      expect(parseId('1')).toBe(1);
      expect(parseId('2')).toBe(2);
      expect(parseId('100')).toBe(100);
    });

    it('should throw error for invalid ID', () => {
      expect(() => parseId('abc')).toThrow('Invalid task ID');
      expect(() => parseId('0')).toThrow('Invalid task ID');
      expect(() => parseId('-1')).toThrow('Invalid task ID');
    });
  });

  describe('extractIdFromLine', () => {
    it('should extract ID from task line with #', () => {
      expect(extractIdFromLine('- [ ] id:#001 Task description')).toBe(1);
      expect(extractIdFromLine('- [x] id:#002 Completed task')).toBe(2);
    });

    it('should extract ID from task line without #', () => {
      expect(extractIdFromLine('- [ ] id:001 Task description')).toBe(1);
      expect(extractIdFromLine('- [x] id:100 Task description')).toBe(100);
    });

    it('should return undefined if no ID found', () => {
      expect(extractIdFromLine('- [ ] Task description')).toBeUndefined();
      expect(extractIdFromLine('Some other line')).toBeUndefined();
    });
  });

  describe('getNextId', () => {
    it('should return 1 for empty array', () => {
      expect(getNextId([])).toBe(1);
    });

    it('should return max + 1', () => {
      expect(getNextId([1, 2, 3])).toBe(4);
      expect(getNextId([1, 5, 3])).toBe(6);
      expect(getNextId([100])).toBe(101);
    });
  });
});
