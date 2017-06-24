/* @flow */
/* eslint-env node, jest */

import { getValue, isSet } from './settingsReducer';

describe('settingsReducer', () => {

    describe('getValue', () => {

        it('should return the value of the setting', () => {
            expect(getValue(({}: Object), 'key')).toBeUndefined();
            expect(getValue(({key: true}: Object), 'key')).toBe(true);
            expect(getValue(({key: 'foo bar'}: Object), 'key')).toBe('foo bar');
        });
    });

    describe('isSet', () => {
        it('should return false if value is falsy', () => {
            expect(isSet(({}: Object), 'key')).toBe(false);
            expect(isSet(({key: null}: Object), 'key')).toBe(false);
            expect(isSet(({key: undefined}: Object), 'key')).toBe(false);
            expect(isSet(({key: false}: Object), 'key')).toBe(false);
        });
        it('should return true if value is truthy', () => {
            expect(isSet(({key: 'abc'}: Object), 'key')).toBe(true);
            expect(isSet(({key: true}: Object), 'key')).toBe(true);
        });
    });
});