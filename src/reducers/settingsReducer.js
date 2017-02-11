import { SET_PLAY_RANDOM, SET_VOLUME } from '../actions/actionKeys';


const settings = (state = {}, action) => {
    switch (action.type) {
        case SET_PLAY_RANDOM:
            if(state.playRandom !== !!action.playRandom) {
                return {...state, playRandom: action.playRandom};
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
