/* @flow */
import {REQUEST_SONG_LYRICS, RECEIVE_SONG_LYRICS } from '../actions/actionKeys';
import type { Action, PlaylistEntry } from '../types';


export type LyricsState = {
    +[string]: {
        +[string]: {
            +isFetching: boolean,
            +lyrics?: any,
            +artist?: string,
            +song?: string,
            +error?: any,
            +receivedAt?: number
        }
    }
}

const lyrics = (state: LyricsState = {}, action: Action) => {
    switch (action.type) {

        case REQUEST_SONG_LYRICS:
            return {
                ...state,
                [action.artist]: {
                    ...state[action.artist],
                    [action.song]: {
                        isFetching: true
                    }
                }
            };

        case RECEIVE_SONG_LYRICS:
            return {
                ...state,
                [action.artist]: {
                    ...state[action.artist],
                    [action.song]: {
                        isFetching: false,
                        lyrics: action.lyrics && action.lyrics.lyrics,
                        artist: action.lyrics && action.lyrics.artist,
                        song: action.lyrics && action.lyrics.song,
                        error: action.error,
                        receivedAt: action.receivedAt
                    }
                }
            };
    }
    return state;
};

export default lyrics;

/* ============ selectors =================*/
export const getLyrics = (state: LyricsState={}, aSong: ?PlaylistEntry) => {
    if(aSong) {
        const {artist, song} = aSong;
        if (artist && song) {
            const lyrics = state[artist] && state[artist][song] && state[artist][song];
            return lyrics || undefined;
        }
    }
    return undefined;
};
