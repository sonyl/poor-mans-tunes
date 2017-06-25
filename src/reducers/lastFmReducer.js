/* @flow */
import {REQUEST_ARTIST, RECEIVE_ARTIST, REQUEST_ALBUM, RECEIVE_ALBUM} from '../actions/actionKeys';
import type { Action, LastFmInfoContainer, LastFmInfo } from '../types';


const ARTIST_INFO_ATTR = '__ARTIST_INFO';

export type LastFmState = { +[string]: { +[string]: LastFmInfoContainer } }
const defaultState: LastFmState = {};

const lastFm = (state: LastFmState = defaultState, action: Action) => {
    switch (action.type) {

        case REQUEST_ARTIST:
            return {
                ...state,
                [action.artist]: {
                    ...state[action.artist],
                    [ARTIST_INFO_ATTR]: {
                        isFetching: true
                    }
                }
            };

        case RECEIVE_ARTIST:
            return {
                ...state,
                [action.artist]: {
                    ...state[action.artist],
                    [ARTIST_INFO_ATTR]: {
                        isFetching: false,
                        info: action.lastFmInfo,
                        error: action.error,
                        receivedAt: action.receivedAt
                    }
                }
            };


        case REQUEST_ALBUM:
            return {
                ...state,
                [action.artist]: {
                    ...state[action.artist],
                    [action.album]: {
                        isFetching: true
                    }
                }
            };

        case RECEIVE_ALBUM:
            return {
                ...state,
                [action.artist]: {
                    ...state[action.artist],
                    [action.album]: {
                        ...state[action.artist][action.album],
                        isFetching: false,
                        info: action.lastFmInfo,
                        error: action.error,
                        receivedAt: action.receivedAt
                    }
                }
            };
    }
    return state;
};

export default lastFm;

/* ============ selectors =================*/
export const getArtistInfo = (state: LastFmState = defaultState, artist: ?string): ?LastFmInfo => {
    const container = artist && state[artist] && state[artist][ARTIST_INFO_ATTR] && state[artist][ARTIST_INFO_ATTR];
    return container ? container.info : undefined;
};
export const getAlbumInfo = (state: LastFmState = defaultState, artist: ?string, album: ?string): ?LastFmInfo => {
    const container = artist && album && state[artist] && state[artist][album] && state[artist][album];
    return container ? container.info : undefined;
};
