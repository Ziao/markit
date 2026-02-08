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

        it('should format IDs greater than 999', () => {
            expect(formatId(999)).toBe('#999');
            expect(formatId(1000)).toBe('#1000');
            expect(formatId(1001)).toBe('#1001');
            expect(formatId(1234)).toBe('#1234');
            expect(formatId(9999)).toBe('#9999');
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

        it('should parse IDs greater than 999', () => {
            expect(parseId('#999')).toBe(999);
            expect(parseId('#1000')).toBe(1000);
            expect(parseId('#1001')).toBe(1001);
            expect(parseId('#1234')).toBe(1234);
            expect(parseId('#9999')).toBe(9999);
        });

        it('should parse ID without # prefix', () => {
            expect(parseId('001')).toBe(1);
            expect(parseId('002')).toBe(2);
            expect(parseId('100')).toBe(100);
            expect(parseId('1000')).toBe(1000);
            expect(parseId('1234')).toBe(1234);
        });

        it('should parse ID as single number', () => {
            expect(parseId('1')).toBe(1);
            expect(parseId('2')).toBe(2);
            expect(parseId('100')).toBe(100);
            expect(parseId('1000')).toBe(1000);
        });

        it('should throw error for invalid ID', () => {
            expect(() => parseId('abc')).toThrow('Invalid task ID');
            expect(() => parseId('0')).toThrow('Invalid task ID');
            expect(() => parseId('-1')).toThrow('Invalid task ID');
        });
    });

    describe('extractIdFromLine', () => {
        it('should extract ID from task line', () => {
            expect(extractIdFromLine('- [ ] id:001 Task description')).toBe(1);
            expect(extractIdFromLine('- [x] id:002 Completed task')).toBe(2);
            expect(extractIdFromLine('- [ ] id:100 Task description')).toBe(100);
        });

        it('should extract IDs greater than 999', () => {
            expect(extractIdFromLine('- [ ] id:999 Task description')).toBe(999);
            expect(extractIdFromLine('- [ ] id:1000 Task description')).toBe(1000);
            expect(extractIdFromLine('- [x] id:1234 Completed task')).toBe(1234);
            expect(extractIdFromLine('- [ ] id:9999 Task description')).toBe(9999);
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

        it('should handle IDs greater than 999', () => {
            expect(getNextId([999])).toBe(1000);
            expect(getNextId([1000])).toBe(1001);
            expect(getNextId([999, 1000, 1234])).toBe(1235);
            expect(getNextId([9999])).toBe(10000);
        });
    });
});
