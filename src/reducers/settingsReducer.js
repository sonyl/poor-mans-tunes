import { SET_PLAY_RANDOM } from '../actions/actionKeys';


const settings = (state = {}, action) => {
    switch (action.type) {
        case SET_PLAY_RANDOM:
            return state.playRandom === !!action.playRandom ? state : { playRandom: action.playRandom };
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
