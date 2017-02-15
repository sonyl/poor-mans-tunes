import {REQUEST_ARTIST, RECEIVE_ARTIST, REQUEST_ALBUM, RECEIVE_ALBUM} from '../actions/actionKeys';

const ARTIST_INFO_ATTR = '__ARTIST_INFO';

const lastFm = (state = {}, action) => {
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
export const getArtistInfo = (state={}, artist) => {
    return state[artist] && state[artist][ARTIST_INFO_ATTR] && state[artist][ARTIST_INFO_ATTR].info;

};
export const getAlbumInfo = (state={}, artist, album) => {
    return state[artist] && state[artist][album] && state[artist][album].info;
};
