import { ADD_TO_PLAYLIST, REMOVE_FROM_PLAYLIST, CLEAR_PLAYLIST, MOVE_ITEM_TO_POSITION } from '../actions/playlistActions';


const playlist = (state = [], props) => {
    switch (props.type) {
        case ADD_TO_PLAYLIST: {
            const {artist, album, songs, top} = props;

            if(artist && album && songs && Array.isArray(songs)) {
                const entries = songs.map(s => ({artist, album, song: s.song, url: s.url}));

                if (top) {
                    return [...entries, ...state];
                } else {
                    return [...state, ...entries];
                }
            }
            break;
        }
        case REMOVE_FROM_PLAYLIST: {
            const {index} = props;
            return [
                ...state.slice(0, index),
                ...state.slice(index + 1)
            ];
        }
        case CLEAR_PLAYLIST: {
            return [];
        }
        case MOVE_ITEM_TO_POSITION: {
            const {index, newIndex} = props;
            let retVal = state;
            if(state[index] && state[newIndex] && index < newIndex) {
                retVal = [
                    ...state.slice(0, index),
                    ...state.slice(index + 1, newIndex + 1),
                    state[index],
                    ...state.slice(newIndex +1)
                ];
            }
            if(state[index] && state[newIndex] && index > newIndex) {
                retVal = [
                    ...state.slice(0, newIndex),
                    state[index],
                    ...state.slice(newIndex, index),
                    ...state.slice(index + 1)
                ];
            }
            console.log('MOVE_ITEM_TO_POSITION %d -> %d', index, newIndex, state, retVal);
            return retVal;
        }
    }
    return state;
};

export default playlist;
