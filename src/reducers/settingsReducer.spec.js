/* eslint-env node, jest */

import { getValue, isSet } from './settingsReducer';

describe('settingsReducer', () => {

    describe('getValue', () => {

        it('should return the value of the setting', () => {
            expect(getValue({}, 'key')).toBeUndefined();
            expect(getValue({key: true}, 'key')).toBe(true);
            expect(getValue({key: 'foo bar'}, 'key')).toBe('foo bar');
        });
    });

    describe('isSet', () => {
        it('should return false if value is falsy', () => {
            expect(isSet({}, 'key')).toBe(false);
            expect(isSet({key: null}, 'key')).toBe(false);
            expect(isSet({key: undefined}, 'key')).toBe(false);
            expect(isSet({key: false}, 'key')).toBe(false);
        });
        it('should return true if value is truthy', () => {
            expect(isSet({key: 'abc'}, 'key')).toBe(true);
            expect(isSet({key: true}, 'key')).toBe(true);
        });
    });
});