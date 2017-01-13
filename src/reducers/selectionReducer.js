import {SELECT_ARTIST, REQUEST_ARTIST, RECEIVE_ARTIST, UNSELECT_ARTIST,
    SELECT_ALBUM, REQUEST_ALBUM, UNSELECT_ALBUM, RECEIVE_ALBUM} from '../actions/selectionActions';


const defaultState = {
    artist: {},
    album: {}
};

const selection = (state = defaultState, action) => {
    switch (action.type) {
        case SELECT_ARTIST:
            if(!state.artist || state.artist.index !== action.index) {
                return Object.assign({}, state, {
                    artist: {
                        index: action.index,
                        name: action.name
                    }
                });
            }
            break;

        case REQUEST_ARTIST:
            return Object.assign({}, state, {
                artist: {
                    ...state.artist,
                    isFetching: true,
                    didInvalidate: false
                }
            });

        case RECEIVE_ARTIST:
            return Object.assign({}, state, {
                artist: {
                    ...state.artist,
                    isFetching: false,
                    didInvalidate: false,
                    lastFmInfo: action.lastFmInfo,
                    error: action.error
                }
            });

        case UNSELECT_ARTIST:
            return {
            };

        case SELECT_ALBUM:
            return Object.assign({}, state, {
                album: {
                    index: action.index,
                    name: action.name,
                    album: action.album
                }
            });

        case REQUEST_ALBUM:
            return Object.assign({}, state, {
                album: {
                    ...state.album,
                    isFetching: true,
                    didInvalidate: false
                }
            });

        case RECEIVE_ALBUM:
            return Object.assign({}, state, {
                album: {
                    ...state.album,
                    isFetching: false,
                    didInvalidate: false,
                    lastFmInfo: action.lastFmInfo,
                    error: action.error
                }
            });

        case UNSELECT_ALBUM:
            return {
                artist: state.artist,
                album: {}
            };
    }
    return state;
};

export default selection;
