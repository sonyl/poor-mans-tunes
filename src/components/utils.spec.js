/* eslint-env node, jest */
import { urlsEqual } from './utils';

describe('urlsEqual', () => {
    it('should return true, if both args are equal strings', () => {
        expect(urlsEqual('abc', 'abc')).toBe(true);
    });
    it('should return false, if both args are unequal strings', () => {
        expect(urlsEqual('abc', 'abe')).toBe(false);
    });
    it('should return true, if both args are falsy', () => {
        expect(urlsEqual(null, undefined)).toBe(true);
        expect(urlsEqual(null, '')).toBe(true);
        expect(urlsEqual(undefined, '')).toBe(true);
        expect(urlsEqual(undefined, false)).toBe(true);
    });
    it('should return false, if one arg is undefined, the other a string', () => {
        expect(urlsEqual(undefined, 'yes')).toBe(false);
    });
    it('should return false, if one arg is string, the other a array', () => {
        expect(urlsEqual('yes', ['abc'])).toBe(false);
    });
    it('should return false, if both args are arrays, different length', () => {
        expect(urlsEqual(['abc'], ['abc', 'efg'])).toBe(false);
    });
    it('should return true, if both args are empty array', () => {
        expect(urlsEqual([], [])).toBe(true);
    });
    it('should return true, if both args are arrays with same string elements', () => {
        expect(urlsEqual(['abc'], ['abc'])).toBe(true);
        expect(urlsEqual(['abc', 'xyz'], ['abc', 'xyz'])).toBe(true);
    });
});