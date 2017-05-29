/* eslint-env node, jest */

import { getLyrics } from './index.js';

describe('lyricsReducer', () => {
    describe('getLyrics', () => {


        const playlist = [{artist: 'artist1', song: 'song1'}];
        const lyrics = {artist1: {song1: {lyrics: 'another silly lovesong'}}};

        const createState = (lyrics, playlist) => ({lyrics, playlist});

        it('should return undefined if no lyrics available', () => {
            expect(getLyrics(createState({}, playlist))).not.toBeDefined();
            expect(getLyrics(createState({ artist2: {song2: { lyrics: 'lyrics'}}}))).not.toBeDefined();
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