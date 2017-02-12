/* eslint-env node, jest */

import { getArtist, getAlbum } from './selectionReducer';

describe('selectionReducer', () => {
    describe('getArtist', () => {

        it('should return undefined nothing is selected', () => {
            expect(getArtist({})).toBeUndefined();
        });

        it('should return the artist object if available', () => {
            expect(getArtist({artist: 'abc'})).toBe('abc');
        });
    });

    describe('getAlbum', () => {
        it('should return undefined nothing is selected', () => {
            expect(getAlbum({})).toBeUndefined();
        });

        it('should return the album object if available', () => {
            expect(getAlbum({album: 'abc'})).toBe('abc');
        });
    });
});