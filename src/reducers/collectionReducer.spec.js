/* eslint-env node, jest */

import { getArtists, getArtist, getAlbum, getAlbumByName, getRandomSong } from './collectionReducer';

describe('collectionReducer', () => {

    const state = { artists: [
        {
            artist: 'Artist1',
            albums: [
                {
                    album: 'Album1', artist: 'Artist1', songs: [
                        {title: 'Song1', mp3: 'url1'}
                    ]
                }
            ]
        }, {
            artist: 'Artist2',
            albums: [
                {
                    album: 'Album2', artist: 'Artist2', songs: [
                        {title: 'Song2', mp3: 'url2'}
                    ]
                }, {
                    album: 'Album3', artist: 'Artist2', songs: [
                        {title: 'Song3', mp3: 'url3'}
                    ]
                }
            ]
        }
    ]};

    describe('getArtists', () => {
        it('should return empty array if collection unavailable',  () => {
            expect(getArtists({})).toEqual([]);
        });

        it('should return the artists array if collection available',  () => {
            expect(getArtists(state)).toEqual(state.artists);
        });
    });

    describe('getArtist', () => {

        it('should return null if index is invalid', () => {
            expect(getArtist(state, 'abc')).toBeNull();
        });

        it('should return null if index not found', () => {
            expect(getArtist(state, 5)).toBeNull();
        });


        it('should return the artist object if available', () => {
            expect(getArtist(state, 1).artist).toBe('Artist2');
        });

    });

    describe('getAlbum', () => {
        it('should return null if index is invalid', () => {
            expect(getAlbum(state, -2, undefined)).toBeNull();
        });

        it('should return null if index not found', () => {
            expect(getAlbum(state, 1, 5)).toBeNull();
        });

        it('should return the album object if available', () => {
            expect(getAlbum(state, 1, 1).album).toBe('Album3');
        });
    });

    describe('getAlbumByName', () => {
        it('should return null if artist not found', () => {
            expect(getAlbumByName(state, 'Artist3', 'Album2')).toBeNull();
            expect(getAlbumByName(state, 'Artist2', 'Album4')).toBeNull();
        });

        it('should return the album object if available', () => {
            expect(getAlbumByName(state, 'Artist2', 'Album3').album).toBe('Album3');
        });
    });

    describe('getRandomSong', () => {
        it('should return null if collection is empty', () => {
            expect(getRandomSong({})).toBeNull();
        });

        it('should return the song object selected by random', () => {
            expect(['Song1', 'Song2', 'Song3']).toContainEqual(getRandomSong(state).songs[0].song);
        });
    });
});