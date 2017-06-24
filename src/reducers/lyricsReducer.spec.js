/* @flow */
/* eslint-env node, jest */

import { getLyrics } from './index';
import type { LyricsState } from './lyricsReducer';
import type { PlaylistState } from './playlistReducer';

describe('lyricsReducer', () => {
    describe('getLyrics', () => {


        const playlist = [{artist: 'artist1', album: 'album', song: 'song1', url: '/test'}];
        const lyrics = {artist1: {song1: {lyrics: 'another silly lovesong', isFetching: false}}};

        const createState = (lyrics: LyricsState, playlist: ?PlaylistState) => ({lyrics, playlist }: Object);


        it('should return undefined if no lyrics available', () => {
            expect(getLyrics(createState({ abc: {haha: {isFetching: false}}}, playlist))).not.toBeDefined();
            expect(getLyrics(createState({ artist2: {song2: { lyrics: 'lyrics', isFetching:false }}}))).not.toBeDefined();
        });

        it('should return undefined if playlist is empty', () => {
            expect(getLyrics(createState(lyrics))).not.toBeDefined();
            expect(getLyrics(createState(lyrics, []))).not.toBeDefined();
        });


        it('should return the lyrics if playlist is not empty and lyrics are available', () => {
            expect(getLyrics(createState(lyrics, playlist))).toEqual(lyrics.artist1.song1);
        });
    });
});