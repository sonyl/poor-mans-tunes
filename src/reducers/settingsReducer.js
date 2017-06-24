/* @flow */
import { SET_PLAY_RANDOM_SONG, SET_PLAY_RANDOM_ALBUM, SET_VOLUME } from '../actions/actionKeys';
import type { Action } from '../types';


export type SettingsState = {
    +playRandomSong: boolean,
    +playRandomAlbum: boolean,
    +volume: number
};

const defaultState: SettingsState = {playRandomSong: false, playRandomAlbum: false, volume: 80};

const settings = (state: SettingsState = defaultState, action: Action) => {
    switch (action.type) {
        case SET_PLAY_RANDOM_SONG:
            if(state.playRandomSong !== !!action.playRandom) {
                return {...state, playRandomSong: action.playRandom};
            }
            break;
        case SET_PLAY_RANDOM_ALBUM:
            if(state.playRandomAlbum !== !!action.playRandom) {
                return {...state, playRandomAlbum: action.playRandom};
            }
            break;
        case SET_VOLUME:
            if(state.volume !== action.volume) {
                return {...state, volume: action.volume};
            }
            break;
    }
    return state;
};

export default settings;


export const getValue = (state: SettingsState, key: string) => {
    return state && state[key];
};


export const isSet = (state: SettingsState, key: string) => {
    return !!getValue(state, key);
};
