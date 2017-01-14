import { ADD_TO_PLAYLIST, REMOVE_FROM_PLAYLIST, CLEAR_PLAYLIST } from '../actions/playlistActions';


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
    }
    return state;
};

export default playlist;
