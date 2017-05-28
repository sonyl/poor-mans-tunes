import { ADD_SONG_TO_PLAYLIST, REMOVE_SONG_FROM_PLAYLIST, CLEAR_PLAYLIST, MOVE_SONG_TO_POSITION } from '../actions/actionKeys';


const playlist = (state = [], props) => {
    switch (props.type) {
        case ADD_SONG_TO_PLAYLIST: {
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
        case REMOVE_SONG_FROM_PLAYLIST: {
            const {index} = props;
            return [
                ...state.slice(0, index),
                ...state.slice(index + 1)
            ];
        }
        case CLEAR_PLAYLIST: {
            return [];
        }
        case MOVE_SONG_TO_POSITION: {
            const {index, newIndex} = props;
            if(state[index] && state[newIndex] && index < newIndex) {
                return  [
                    ...state.slice(0, index),
                    ...state.slice(index + 1, newIndex + 1),
                    state[index],
                    ...state.slice(newIndex +1)
                ];
            }
            if(state[index] && state[newIndex] && index > newIndex) {
                return  [
                    ...state.slice(0, newIndex),
                    state[index],
                    ...state.slice(newIndex, index),
                    ...state.slice(index + 1)
                ];
            }
        }
    }
    return state;
};

export default playlist;

export const isPlaylistEmpty = playlist => {
    return !playlist || playlist.length == 0;
};

export const getCurrentSong = playlist => {
    return playlist && playlist.length > 0 ? { artist: playlist[0].artist, song: playlist[0].song } : null;
};


