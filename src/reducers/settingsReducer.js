/* @flow */
import { SET_PLAY_RANDOM_SONG, SET_PLAY_RANDOM_ALBUM, SET_VOLUME, SET_PERSISTED_VALUE } from '../actions/actionKeys';
import type { Action } from '../types';


export type SettingsState = {
    +playRandomSong: boolean,
    +playRandomAlbum: boolean,
    +volume: number,
    +persisted?: {
        +selectedFont: string
    }
};

// defaultState is set in index.js createStore method
const defaultState: SettingsState = {playRandomSong: false, playRandomAlbum: false, volume: 0.8};

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
        case SET_PERSISTED_VALUE: {
            return {
                ...state,
                persisted: Object.assign({}, state.persisted, {[action.key]: action.value})
            };
        }
    }
    return state;
};

export default settings;


export const getValue = (state: SettingsState, key: string): mixed => {
    return state && state[key];
};


export const isSet = (state: SettingsState, key: string) => {
    return !!getValue(state, key);
};

export const getPersistedValue = (state: SettingsState, key: string): ?(string | {}) => {
    return (state && state.persisted && state.persisted[key]);
};

