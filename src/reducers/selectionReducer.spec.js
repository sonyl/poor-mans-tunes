/* @flow */
/* eslint-env node, jest */

import { getArtist, getAlbum } from './selectionReducer';

describe('selectionReducer', () => {
    describe('getArtist', () => {

        it('should return undefined nothing is selected', () => {
            expect(getArtist(({}: Object))).toBeUndefined();
        });

        it('should return the artist object if available', () => {
            expect(getArtist(({artist: 'abc'}: Object))).toBe('abc');
        });
    });

    describe('getAlbum', () => {
        it('should return undefined nothing is selected', () => {
            expect(getAlbum(({}: Object))).toBeUndefined();
        });

        it('should return the album object if available', () => {
            expect(getAlbum(({album: 'abc'}: Object))).toBe('abc');
        });
    });
});