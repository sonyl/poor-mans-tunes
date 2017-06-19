/* @flow */
import {SELECT_ARTIST, UNSELECT_ARTIST, SELECT_ALBUM, UNSELECT_ALBUM } from '../actions/actionKeys';
import type { Action } from '../types';


export type SelectionState = {
    artist: {index?: number, name?: string},
    album: {index?: number, name?: string}
};


const defaultState: SelectionState = {
    artist: {},
    album: {}
};

const selection = (state: SelectionState = defaultState, action: Action) => {
    switch (action.type) {
        case SELECT_ARTIST:
            if(!state.artist || state.artist.index !== action.index) {
                return {
                    artist: {
                        index: action.index,
                        name: action.name
                    },
                    album: {}
                };
            }
            break;

        case UNSELECT_ARTIST:
            return defaultState;

        case SELECT_ALBUM:
            return {
                ...state,
                album: {
                    index: action.index,
                    name: action.name
                }
            };

        case UNSELECT_ALBUM:
            return {
                ...state,
                album: {}
            };
    }
    return state;
};

export const getArtist = (state: SelectionState) => {
    return state && state.artist;
};

export const getAlbum = (state: SelectionState) => {
    return state && state.album;
};

export default selection;
