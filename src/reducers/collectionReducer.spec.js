/* @flow */
/* eslint-env node, jest */

import { getArtists, getArtist, getAlbum, getAlbumByName, getRandomSong, getRandomAlbumSongs } from './collectionReducer';
import type { CollectionState } from './collectionReducer';

describe('collectionReducer', () => {

    const state:CollectionState  = {
        artists: [
            {
                artist: 'Artist1',
                albums: [
                    {
                        album: 'Album1', artist: 'Artist1', songs: [
                            {title: 'Song1', src: 'url1', track: 1}
                        ]
                    }
                ]
            }, {
                artist: 'Artist2',
                albums: [
                    {
                        album: 'Album2', artist: 'Artist2', songs: [
                            {title: 'Song2', src: 'url2', track: 2}
                        ]
                    }, {
                        album: 'Album3', artist: 'Artist2', songs: [
                            {title: 'Song3', src: 'url3', track: 3},
                            {title: 'Song4', src: 'url4', track: 4}
                        ]
                    }
                ]
            }
        ],
        isFetching: false};

    describe('getArtists', () => {
        it('should return empty array if collection unavailable',  () => {
            expect(getArtists({ artists: [], isFetching: false})).toEqual([]);
        });

        it('should return the artists array if collection available',  () => {
            expect(getArtists(state)).toEqual(state.artists);
        });
    });

    describe('getArtist', () => {

        it('should return null if index is invalid', () => {
            expect(getArtist(state)).toBeNull();
        });

        it('should return null if index not found', () => {
            expect(getArtist(state, 5)).toBeNull();
        });


        it('should return the artist object if available', () => {
            const artist = getArtist(state, 1);
            expect(artist && artist.artist).toBe('Artist2');
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
            const album = getAlbum(state, 1, 1);
            expect(album && album.album).toBe('Album3');
        });
    });

    describe('getAlbumByName', () => {
        it('should return null if artist not found', () => {
            expect(getAlbumByName(state, 'Artist3', 'Album2')).toBeNull();
            expect(getAlbumByName(state, 'Artist2', 'Album4')).toBeNull();
        });

        it('should return the album object if available', () => {
            const album = getAlbumByName(state, 'Artist2', 'Album3');

            expect(album && album.album).toBe('Album3');
        });
    });

    describe('getRandomSong', () => {
        it('should return null if collection is empty', () => {
            expect(getRandomSong({ artists: [], isFetching: false})).toBeNull();
        });

        it('should return the song object selected by random', () => {
            const  {artist, album, songs } = getRandomSong(state) || {};
            expect(['Artist1', 'Artist2']).toContainEqual(artist);
            expect(['Album1', 'Album2', 'Album3']).toContainEqual(album);
            expect(['Song1', 'Song2', 'Song3', 'Song4']).toContainEqual(songs[0].song);
        });
    });

    describe('getRandomAlbum', () => {
        it('should return null if collection is empty', () => {
            expect(getRandomAlbumSongs({ artists: [], isFetching: false})).toBeNull();
        });

        it('should return the song object selected by random', () => {
            let randomAlbum = {};

            while(randomAlbum.album !== 'Album3') {
                randomAlbum = getRandomAlbumSongs(state);       // try until random selects 'Album3'
            }

            expect(randomAlbum && randomAlbum.artist).toBe('Artist2');
            expect(randomAlbum && randomAlbum.songs).toEqual([{song: 'Song3', url: 'url3'}, {song: 'Song4', url: 'url4'}]);
        });
    });
});