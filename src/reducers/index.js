import { combineReducers } from 'redux';
import {
    REQUEST_ALBUMS, RECEIVE_ALBUMS, INVALIDATE_ALBUMS, SELECT_ARTIST, REQUEST_ARTIST, RECEIVE_ARTIST,
    SELECT_ALBUM, REQUEST_ALBUM, RECEIVE_ALBUM, SELECT_SONG
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

const currentArtist = (state = {}, action) => {
    switch (action.type) {
    case SELECT_ARTIST:
        return {
            index: action.index,
            name: action.name,
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

const currentAlbum = (state = {}, action) => {
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
    }
    return state;
};

const currentSong = (state = {}, action) => {
    switch (action.type) {
    case SELECT_SONG:
        return {
            index: action.index,
            name: action.name,
            song: action.song
        };
    }
    return state;
};


const rootReducer = combineReducers({
    albums,
    currentArtist,
    currentAlbum,
    currentSong
});

export default rootReducer;

