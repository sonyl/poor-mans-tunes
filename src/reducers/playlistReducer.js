import {ADD_TO_PLAYLIST, REMOVE_FROM_PLAYLIST} from '../actions/playlistActions';


const playlist = (state = [], {type, ...props}) => {
    switch (type) {
        case ADD_TO_PLAYLIST: {
            const {artistIndex, albumIndex, songIndex} = props;
            const indexes = Array.isArray(songIndex) ? songIndex : [songIndex];
            const songs = indexes.map(i => ({artistIndex, albumIndex, songIndex: i}));

            return [
                ...state,
                ... songs
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

export default playlist;
