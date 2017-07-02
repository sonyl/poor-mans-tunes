/* @flow */
import { addRandomSongsToPlaylistIfNecessary } from './playlistActions';
import { SET_PLAY_RANDOM_SONG, SET_PLAY_RANDOM_ALBUM, SET_VOLUME, SET_PERSISTED_VALUE } from './actionKeys';

import type { Dispatch, GetState } from '../types';

export type PlayRandomSong = {
    type: 'SET_PLAY_RANDOM_SONG',
    playRandom: boolean
}

export type PlayRandomAlbum = {
    type: 'SET_PLAY_RANDOM_ALBUM',
    playRandom: boolean
}

export type SetVolume = {
    type: 'SET_VOLUME',
    volume: number
}

export type PersistValue = {
    type: 'SET_PERSISTED_VALUE',
    key: string,
    value: string | {}
}

export const setPlayRandomSong = (playRandom: boolean) => (dispatch: Dispatch, getState: GetState) => {
    dispatch(({
        type: SET_PLAY_RANDOM_SONG,
        playRandom
    }: PlayRandomSong));
    dispatch(addRandomSongsToPlaylistIfNecessary());
};

export const setPlayRandomAlbum = (playRandom: boolean) => (dispatch: Dispatch, getState: GetState) => {
    dispatch(({
        type: SET_PLAY_RANDOM_ALBUM,
        playRandom
    }: PlayRandomAlbum));
    dispatch(addRandomSongsToPlaylistIfNecessary());
};

export const setVolume = (volume: number): SetVolume => ({
    type: SET_VOLUME,
    volume
});

export const setPersistedValue = (key: string, value: string | {}) => (dispatch: Dispatch, getState: GetState) => {
    dispatch(({type: SET_PERSISTED_VALUE, key, value}: PersistValue));
    if (typeof value === 'string') {
        localStorage.setItem(key, value);
    } else {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.log('can not serialize or store %s=%o, error=%o', key, value, error);
        }
    }
};