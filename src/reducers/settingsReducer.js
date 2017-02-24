import { SET_PLAY_RANDOM_SONG, SET_PLAY_RANDOM_ALBUM, SET_VOLUME } from '../actions/actionKeys';


const settings = (state = {}, action) => {
    switch (action.type) {
        case SET_PLAY_RANDOM_SONG:
            if(state.playRandomSong !== !!action.playRandom) {
                return {...state, playRandomSong: action.playRandom};
            }
            break;
        case SET_PLAY_RANDOM_ALBUM:
            if(state.playRandomAlbum !== !!action.playRandom) {
                return {...state, playRandomAlbum: action.playRandom};
            }
            break;
        case SET_VOLUME:
            if(state.volume !== action.volume) {
                return {...state, volume: action.volume};
            }
            break;
    }
    return state;
};

export default settings;


export const getValue = (state, key) => {
    return state && state[key];
};


export const isSet = (state, key) => {
    return !!getValue(state, key);
};
