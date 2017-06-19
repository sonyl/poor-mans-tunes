/* @flow */
import { addRandomSongsToPlaylistIfNecessary } from './playlistActions';
import { SET_PLAY_RANDOM_SONG, SET_PLAY_RANDOM_ALBUM, SET_VOLUME } from './actionKeys';

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