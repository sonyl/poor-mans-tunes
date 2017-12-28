/* @flow */
import { getRandomSong, getRandomAlbumSongs, isPlaylistEmpty, isSetInSettings, findSongByUrl } from '../reducers';
import { ADD_SONG_TO_PLAYLIST, SET_PLAYLISTENTRY_TO_PLAYLIST, REMOVE_SONG_FROM_PLAYLIST, CLEAR_PLAYLIST,
    MOVE_SONG_TO_POSITION } from './actionKeys';

import type { Dispatch, GetState, PlaylistSong, PlaylistEntry } from '../types';

export type AddSongsToPlaylist = {
    type: 'ADD_SONG_TO_PLAYLIST',
    artist: string,
    album: string,
    songs: PlaylistSong[],
    top: boolean
}

export type SetPlaylistEntriesToPlaylist = {
    type: 'SET_PLAYLISTENTRY_TO_PLAYLIST',
    entries: Array<PlaylistEntry>
}

export type RemoveSongFromPlaylist = {
    type: 'REMOVE_SONG_FROM_PLAYLIST',
    index: number
}

export type ClearPlaylist = {
    type: 'CLEAR_PLAYLIST'
}

export type MoveSongToPositionInPlaylist = {
    type: 'MOVE_SONG_TO_POSITION',
    index: number,
    newIndex: number
}

export const addSongsToPlaylist = (artist: string, album: string, songs: PlaylistSong[] | PlaylistSong,
    top: boolean=false): AddSongsToPlaylist => (
    {
        type: ADD_SONG_TO_PLAYLIST,
        artist,
        album,
        songs: Array.isArray(songs) ? songs : [songs],
        top
    }
);

const setPlaylistEntriesToPlaylist = (entries: Array<PlaylistEntry>): SetPlaylistEntriesToPlaylist => (
    {
        type: SET_PLAYLISTENTRY_TO_PLAYLIST,
        entries
    }
);

export const removeSongAtIndexFromPlaylist = (index: number) => (dispatch: Dispatch) => {
    dispatch(({
        type: REMOVE_SONG_FROM_PLAYLIST,
        index
    }: RemoveSongFromPlaylist));
    dispatch(addRandomSongsToPlaylistIfNecessary());
};

export const clearPlaylist = () => (dispatch: Dispatch) => {
    dispatch(({type: CLEAR_PLAYLIST}: ClearPlaylist));
    dispatch(addRandomSongsToPlaylistIfNecessary());
};

export const addRandomSongToPlaylist = () => (dispatch: Dispatch, getState: GetState) => {
    const randomSong = getRandomSong(getState());
    if (randomSong) {
        dispatch(addSongsToPlaylist(randomSong.artist, randomSong.album, randomSong.songs));
    }
};


export const addRandomSongsToPlaylistIfNecessary = () => (dispatch: Dispatch, getState: GetState) => {
    const state = getState();
    if(isPlaylistEmpty(state)) {
        if (isSetInSettings(state, 'playRandomSong')) {
            const randomSong = getRandomSong(state);
            if (randomSong) {
                dispatch(addSongsToPlaylist(randomSong.artist, randomSong.album, randomSong.songs));
            }
        } else if (isSetInSettings(state, 'playRandomAlbum')) {
            const randomAlbumSongs = getRandomAlbumSongs(state);
            if (randomAlbumSongs) {
                dispatch(addSongsToPlaylist(randomAlbumSongs.artist, randomAlbumSongs.album, randomAlbumSongs.songs));
            }
        }
    }
};

export const moveSongToPositionInPlaylist = (index: number, newIndex: number) => ({
    type: MOVE_SONG_TO_POSITION,
    index,
    newIndex
});

export const replacePlaylist = (urls: Array<string>) => (dispatch: Dispatch, getState: GetState) =>{
    const state = getState();
    const found = urls.map(u => findSongByUrl(state, u));
    const purged = (found.filter(e => !!e): any);
    dispatch(setPlaylistEntriesToPlaylist(purged));
};
