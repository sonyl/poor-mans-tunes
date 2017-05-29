import {REQUEST_SONG_LYRICS, RECEIVE_SONG_LYRICS } from '../actions/actionKeys';

const ARTIST_INFO_ATTR = '__ARTIST_INFO';

const lyrics = (state = {}, action) => {
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
export const getLyrics = (state={}, {artist, song} = {}) => {
    if(artist && song) {
        const lyrics = state[artist] && state[artist][song] && state[artist][song];
        return lyrics || undefined;
    }
    return undefined;
};
