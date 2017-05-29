/* eslint-env node, jest */

import { isPlaylistEmpty, getCurrentSong } from './playlistReducer';

describe('playlistReducer', () => {
    describe('isPlaylistEmpty', () => {

        it('should return true if playlist is empty', () => {
            expect(isPlaylistEmpty()).toBe(true);
            expect(isPlaylistEmpty([])).toBe(true);
        });

        it('should return false if playlist is not empty', () => {
            expect(isPlaylistEmpty([{}])).toBe(false);
        });

    });

    describe('getCurrentSong', () => {

        it('should return undefined if playlist is empty', () => {
            expect(getCurrentSong()).not.toBeDefined();
            expect(getCurrentSong([])).not.toBeDefined();
        });

        it('should return song at pos 0, if playlist is not empty', () => {
            expect(getCurrentSong([{song: 1}, {song: 2}])).toEqual({song: 1});
        });

    });
});