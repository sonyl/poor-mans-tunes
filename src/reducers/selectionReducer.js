import {SELECT_ARTIST, UNSELECT_ARTIST, SELECT_ALBUM, UNSELECT_ALBUM } from '../actions/actionKeys';


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

        case UNSELECT_ARTIST:
            return defaultState;

        case SELECT_ALBUM:
            return Object.assign({}, state, {
                album: {
                    index: action.index,
                    name: action.name
                }
            });

        case UNSELECT_ALBUM:
            return {
                ...state,
                album: {}
            };
    }
    return state;
};

export const getArtist = (state) => {
    return state && state.artist;
};

export const getAlbum = (state) => {
    return state && state.album;
};

export default selection;
