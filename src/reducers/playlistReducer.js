import {ADD_TO_PLAYLIST, REMOVE_FROM_PLAYLIST} from '../actions/playlistActions';


export const playlist = (state = [], {type, ...props}) => {
    switch (type) {
    case ADD_TO_PLAYLIST: {
        const {artistIndex, albumIndex, songIndex} = props;
        return [...state,
            {
                artistIndex,
                albumIndex,
                songIndex
            }
        ];
    }
    case REMOVE_FROM_PLAYLIST: {
        const {index} = props;
        return [
            ...state.slice(0, index),
            ...state.slice(index + 1)
        ];
    }
    }
    return state;
};
