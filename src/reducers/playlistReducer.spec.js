/* eslint-env node, jest */

import reducer from './playlistReducer';
import * as keys  from '../actions/actionKeys';

describe('playlistReducer reducer', () => {

    it('should return the initial state', () => {
        expect(reducer(undefined, {})).toEqual([]);
    });

    it('should handle ADD_SONG_TO_PLAYLIST', () => {
        expect(reducer([],
            { type: keys.ADD_SONG_TO_PLAYLIST, artist: 'Artist', album: 'Album', songs: [{song: 'Song', url: 'a url'}],
                top: false }))
        .toEqual([{
            artist: 'Artist',
            album: 'Album',
            song: 'Song',
            url: 'a url'
        }]);
    });

    it('should handle REMOVE_SONG_FROM_PLAYLIST', () => {
        expect(reducer([ {
            artist: 'Artist',
            album: 'Album',
            song: 'Song',
            url: 'a url'
        }], { type: keys.REMOVE_SONG_FROM_PLAYLIST, index: 0 }))
        .toEqual([]);
    });

    it('should handle CLEAR_PLAYLIST', () => {
        expect(reducer([ {
            artist: 'Artist',
            album: 'Album',
            song: 'Song',
            url: 'a url'
        }], { type: keys.CLEAR_PLAYLIST, index: 0 }))
        .toEqual([]);
    });

    describe('MOVE_SONG_TO_POSITION', () => {
        const playlist = [
            { artist: 'Artist1', album: 'Album1', song: 'Song1', url: 'a url 1' },
            { artist: 'Artist2', album: 'Album2', song: 'Song2', url: 'a url 2' },
            { artist: 'Artist3', album: 'Album3', song: 'Song3', url: 'a url 3' },
            { artist: 'Artist4', album: 'Album4', song: 'Song4', url: 'a url 4' },
            { artist: 'Artist5', album: 'Album5', song: 'Song5', url: 'a url 5' }
        ];

        it('should do nothing if at least one index is undefined', () => {
            expect(reducer(playlist , { type: keys.MOVE_SONG_TO_POSITION, index: 0, newIndex: 6 }))
            .toEqual(playlist);
        });

        it('should do nothing if at least one indexes are equal', () => {
            expect(reducer(playlist , { type: keys.MOVE_SONG_TO_POSITION, index: 3, newIndex: 3 }))
                .toEqual(playlist);
        });

        it('should be able do move items to higher indexes', () => {
            expect(reducer(playlist , { type: keys.MOVE_SONG_TO_POSITION, index: 1, newIndex: 3 }))
            .toEqual([
                { artist: 'Artist1', album: 'Album1', song: 'Song1', url: 'a url 1' },
                { artist: 'Artist3', album: 'Album3', song: 'Song3', url: 'a url 3' },
                { artist: 'Artist4', album: 'Album4', song: 'Song4', url: 'a url 4' },
                { artist: 'Artist2', album: 'Album2', song: 'Song2', url: 'a url 2' },
                { artist: 'Artist5', album: 'Album5', song: 'Song5', url: 'a url 5' }
            ]);
        });

        it('should be able do move items to higher indexes, edge case', () => {
            expect(reducer(playlist , { type: keys.MOVE_SONG_TO_POSITION, index: 0, newIndex: 4 }))
                .toEqual([
                    { artist: 'Artist2', album: 'Album2', song: 'Song2', url: 'a url 2' },
                    { artist: 'Artist3', album: 'Album3', song: 'Song3', url: 'a url 3' },
                    { artist: 'Artist4', album: 'Album4', song: 'Song4', url: 'a url 4' },
                    { artist: 'Artist5', album: 'Album5', song: 'Song5', url: 'a url 5' },
                    { artist: 'Artist1', album: 'Album1', song: 'Song1', url: 'a url 1' }
                ]);
        });

        it('should be able do move items to lower indexes', () => {
            expect(reducer(playlist , { type: keys.MOVE_SONG_TO_POSITION, index: 3, newIndex: 1 }))
                .toEqual([
                    { artist: 'Artist1', album: 'Album1', song: 'Song1', url: 'a url 1' },
                    { artist: 'Artist4', album: 'Album4', song: 'Song4', url: 'a url 4' },
                    { artist: 'Artist2', album: 'Album2', song: 'Song2', url: 'a url 2' },
                    { artist: 'Artist3', album: 'Album3', song: 'Song3', url: 'a url 3' },
                    { artist: 'Artist5', album: 'Album5', song: 'Song5', url: 'a url 5' }
                ]);
        });

        it('should be able do move items to lower indexes, edge case', () => {
            expect(reducer(playlist , { type: keys.MOVE_SONG_TO_POSITION, index: 4, newIndex: 0 }))
                .toEqual([
                    { artist: 'Artist5', album: 'Album5', song: 'Song5', url: 'a url 5' },
                    { artist: 'Artist1', album: 'Album1', song: 'Song1', url: 'a url 1' },
                    { artist: 'Artist2', album: 'Album2', song: 'Song2', url: 'a url 2' },
                    { artist: 'Artist3', album: 'Album3', song: 'Song3', url: 'a url 3' },
                    { artist: 'Artist4', album: 'Album4', song: 'Song4', url: 'a url 4' }
                ]);
        });
    });

});