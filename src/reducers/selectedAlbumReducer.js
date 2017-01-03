import {SELECT_ALBUM, REQUEST_ALBUM, INVALIDATE_ALBUM, RECEIVE_ALBUM} from '../actions/albumActions';

const selectedAlbum = (state = {}, action) => {
    switch (action.type) {
        case SELECT_ALBUM:
            return {
                index: action.index,
                name: action.name,
                album: action.album
            };
        case REQUEST_ALBUM:
            return {
                ...state,
                isFetching: true,
                didInvalidate: false
            };
        case RECEIVE_ALBUM:
            return {
                ...state,
                isFetching: false,
                didInvalidate: false,
                lastFmInfo: action.lastFmInfo,
                error: action.error
            };
        case INVALIDATE_ALBUM:
            return {
            };
    }
    return state;
};

export default selectedAlbum;