import {SELECT_ARTIST, REQUEST_ARTIST, RECEIVE_ARTIST} from '../actions/artistActions';


const selectedArtist = (state = {}, action) => {
    switch (action.type) {
        case SELECT_ARTIST:
            return {
                index: action.index,
                name: action.name
            };
        case REQUEST_ARTIST:
            return {
                ...state,
                isFetching: true,
                didInvalidate: false
            };
        case RECEIVE_ARTIST:
            return {
                ...state,
                isFetching: false,
                didInvalidate: false,
                lastFmInfo: action.lastFmInfo,
                error: action.error
            };
    }
    return state;
};

export default selectedArtist;