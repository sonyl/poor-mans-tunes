/* @flow */
/* eslint-env node, jest */

import { isPlaylistEmpty, getCurrentSong } from './playlistReducer';

describe('playlistReducer', () => {
    const createPlaylistEntry = (song) => ({artist: '', album: '', song, url: ''});

    describe('isPlaylistEmpty', () => {

        it('should return true if playlist is empty', () => {
            expect(isPlaylistEmpty((undefined: any))).toBe(true);
            expect(isPlaylistEmpty([])).toBe(true);
        });

        it('should return false if playlist is not empty', () => {
            expect(isPlaylistEmpty([({}: Object)])).toBe(false);
        });

    });

    describe('getCurrentSong', () => {

        it('should return undefined if playlist is empty', () => {
            expect(getCurrentSong((undefined: any))).not.toBeDefined();
            expect(getCurrentSong([])).not.toBeDefined();
        });

        it('should return song at pos 0, if playlist is not empty', () => {
            const entry = getCurrentSong([createPlaylistEntry('song1'), createPlaylistEntry('song2')]);
            expect(entry && entry.song).toEqual('song1');
        });

    });
});