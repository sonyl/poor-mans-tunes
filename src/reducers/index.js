import { combineReducers } from 'redux';
import {
    REQUEST_ALBUMS, RECEIVE_ALBUMS, INVALIDATE_ALBUMS
} from '../actions';

const albums = (
    state = {
        isFetching: false,
        didInvalidate: false,
        artists: []
    }, action) => {
    switch (action.type) {
    case INVALIDATE_ALBUMS:
        return {
            ...state,
            didInvalidate: true
        };
    case REQUEST_ALBUMS:
        return {
            ...state,
            isFetching: true,
            didInvalidate: false
        };
    case RECEIVE_ALBUMS:
        return {
            ...state,
            isFetching: false,
            didInvalidate: false,
            lastUpdated: action.receivedAt,
            artists: action.artists,
            error: action.error
        };
    default:
        return state;
    }
};


const rootReducer = combineReducers({
    albums
});

export default rootReducer;

