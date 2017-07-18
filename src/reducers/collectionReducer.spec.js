/* @flow */
/* eslint-env node, jest */

import { getArtists, getArtist, getAlbum, getAlbumByName, getRandomSong, getRandomAlbumSongs, findSongByUrl } from './collectionReducer';
import type { CollectionState } from './collectionReducer';

describe('collectionReducer', () => {

    const collection:CollectionState  = {
        artists: [
            {
                artist: 'Artist1',
                albums: [
                    {
                        album: 'Album1', artist: 'Artist1', songs: [
                            {title: 'Song1', src: 'song1.mp3', track: 1}
                        ]
                    }
                ]
            }, {
                artist: 'Artist2',
                albums: [
                    {
                        album: 'Album2', artist: 'Artist2', songs: [
                            {title: 'Song2', src: 'song2.mp3', track: 2}
                        ]
                    }, {
                        album: 'Album3', artist: 'Artist2', songs: [
                            {title: 'Song3', src: 'song3.mp3', track: 3},
                            {title: 'Song4', src: 'song4.mp3', track: 4}
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
            expect(getArtists(collection)).toEqual(collection.artists);
        });
    });

    describe('getArtist', () => {

        it('should return null if index is invalid', () => {
            expect(getArtist(collection)).toBeNull();
        });

        it('should return null if index not found', () => {
            expect(getArtist(collection, 5)).toBeNull();
        });


        it('should return the artist object if available', () => {
            const artist = getArtist(collection, 1);
            expect(artist && artist.artist).toBe('Artist2');
        });

    });

    describe('getAlbum', () => {
        it('should return null if index is invalid', () => {
            expect(getAlbum(collection, -2, undefined)).toBeNull();
        });

        it('should return null if index not found', () => {
            expect(getAlbum(collection, 1, 5)).toBeNull();
        });

        it('should return the album object if available', () => {
            const album = getAlbum(collection, 1, 1);
            expect(album && album.album).toBe('Album3');
        });
    });

    describe('getAlbumByName', () => {
        it('should return null if artist not found', () => {
            expect(getAlbumByName(collection, 'Artist3', 'Album2')).toBeNull();
            expect(getAlbumByName(collection, 'Artist2', 'Album4')).toBeNull();
        });

        it('should return the album object if available', () => {
            const album = getAlbumByName(collection, 'Artist2', 'Album3');

            expect(album && album.album).toBe('Album3');
        });
    });

    describe('getRandomSong', () => {
        it('should return null if collection is empty', () => {
            expect(getRandomSong({ artists: [], isFetching: false})).toBeNull();
        });

        it('should return the song object selected by random', () => {
            const  {artist, album, songs } = getRandomSong(collection) || {};
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
                randomAlbum = getRandomAlbumSongs(collection);       // try until random selects 'Album3'
            }

            expect(randomAlbum && randomAlbum.artist).toBe('Artist2');
            expect(randomAlbum && randomAlbum.songs).toEqual([{song: 'Song3', url: 'song3.mp3'}, {song: 'Song4', url: 'song4.mp3'}]);
        });
    });

    describe('findSongByUrl', () => {
        it('should return undefined if url is not given', () => {
            expect(findSongByUrl(collection, null)).toBeUndefined();
        });
        it('should return undefined if collection is not given', () => {
            expect(findSongByUrl({artists: [], isFetching: false})).toBeUndefined();
        });

        it('should return undefined if url is not found', () => {
            expect(findSongByUrl(collection, 'does not exist')).toBeUndefined();
        });

        it('should return a playlistEntry if url does match exactly', () => {
            expect(findSongByUrl(collection, 'song4.mp3')).toEqual(
                {'album': 'Album3', 'artist': 'Artist2', 'song': 'Song4', 'url': 'song4.mp3'}
            );
        });
        it('should return a playlistEntry if url ends with a match', () => {
            expect(findSongByUrl(collection, 'http:/context/artist/song4.mp3')).toEqual(
                {'album': 'Album3', 'artist': 'Artist2', 'song': 'Song4', 'url': 'song4.mp3'}
            );
        });
    });
});