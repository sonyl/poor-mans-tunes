import {SELECT_ARTIST, UNSELECT_ARTIST, SELECT_ALBUM, UNSELECT_ALBUM, SET_PLAY_RANDOM } from '../actions/selectionActions';


const defaultState = {
    artist: {},
    album: {},
    set: {}
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
                artist: state.artist,
                album: {}
            };

        case SET_PLAY_RANDOM:
            return {
                ...state,
                set: {
                    ...state.playRandom,
                    playRandom: action.playRandom
                }
            };
    }
    return state;
};

export default selection;
