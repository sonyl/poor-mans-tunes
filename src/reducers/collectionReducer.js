/* @flow */
import { REQUEST_COLLECTION, RECEIVE_COLLECTION, INVALIDATE_COLLECTION } from '../actions/actionKeys';
import type { Action, Collection } from '../types';

export type CollectionState = {
    isFetching: boolean,
    artists: Collection,
    didInvalidate?: boolean,
    lastUpdated?: number
}

const defaultState: CollectionState = { isFetching: false, artists: []};

// -----------------reducer (default export)
const collection = ( state: CollectionState = defaultState, action: Action) => {

    switch (action.type) {
        case INVALIDATE_COLLECTION:
            return {
                ...state,
                didInvalidate: true,
                lastUpdated: undefined
            };
        case REQUEST_COLLECTION:
            return {
                ...state,
                isFetching: true,
                didInvalidate: false
            };
        case RECEIVE_COLLECTION:
            return {
                ...state,
                isFetching: false,
                lastUpdated: action.receivedAt,
                artists: action.artists,
                error: action.error
            };
    }
    return state;
};

export default collection;

// ------------ selectors

export const getLastUpdate = (state: CollectionState) => {
    return state && state.lastUpdated;
};

export const getArtists = (state: CollectionState) => {
    return state && state.artists || [];
};

export const getArtist = (state: CollectionState, artistIndex?: number) => {
    if(artistIndex != null && artistIndex >= 0) {
        const artists = state.artists;
        const artist = artists && artists[artistIndex];
        return artist || null;
    }
    return null;
};

export const getAlbum = (state: CollectionState, artistIndex?: number, albumIndex?: number) => {
    if(artistIndex != null && artistIndex >= 0 && albumIndex != null && albumIndex >=0) {
        const artists = state.artists;
        const artist = artists && artists[artistIndex];
        const album = artist && artist.albums[albumIndex];
        return album || null;
    }
    return null;
};

export const getAlbumByName = (state: CollectionState, artist: string, album: string) => {
    const artistIndex = (state.artists || []).findIndex(a => a.artist === artist);
    const selArtist = getArtist(state, artistIndex);
    if(selArtist) {
        const albumIndex = (selArtist.albums || []).findIndex(a => a.album === album);
        if(albumIndex >= 0) {
            return selArtist.albums[albumIndex];
        }
    }
    return null;
};

const getRandomAlbum = (state: CollectionState) => {
    const maxArtists = state.artists && state.artists.length;
    if(maxArtists) {
        const randArtist = state.artists[Math.floor((Math.random() * maxArtists))];
        const maxAlbums = randArtist.albums && randArtist.albums.length;
        if(maxAlbums) {
            const randAlbum = randArtist.albums[Math.floor((Math.random() * maxAlbums))];
            const maxSongs = randAlbum.songs && randAlbum.songs.length;
            if(maxSongs) {
                return {
                    artist: randAlbum.artist,
                    album: randAlbum.album,
                    songs: randAlbum.songs
                };
            }
        }
    }
    return null;
};

export const getRandomAlbumSongs = (state: CollectionState) => {
    const randAlbum = getRandomAlbum(state);
    if(randAlbum) {
        return {
            artist: randAlbum.artist,
            album: randAlbum.album,
            songs: randAlbum.songs.map(song => ({
                song: song.title,
                url:  song.src
            }))
        };
    }
    return null;
};

export const getRandomSong = (state: CollectionState) => {
    const randAlbum = getRandomAlbum(state);
    if(randAlbum) {
        const randSong = randAlbum.songs[Math.floor((Math.random() * randAlbum.songs.length))];
        if(randSong) {
            return {
                artist: randAlbum.artist,
                album: randAlbum.album,
                songs: [
                    {
                        song: randSong.title,
                        url: randSong.src
                    }
                ]
            };
        }
    }
    return null;
};

