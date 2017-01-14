import { getRandomSong } from '../reducers';
export const ADD_TO_PLAYLIST = 'ADD_TO_PLAYLIST';
export const REMOVE_FROM_PLAYLIST = 'REMOVE_FROM_PLAYLIST';
export const CLEAR_PLAYLIST = 'CLEAR_PLAYLIST';

export const addToPlaylist = (artist, album, songs, top=false) => ({
    type: ADD_TO_PLAYLIST,
    artist,
    album,
    songs,
    top
});

export const removeFromPlaylist = (index) => (dispatch, getState) => {
    const { selection, playlist } = getState();
    dispatch({
        type: REMOVE_FROM_PLAYLIST,
        index
    });
    if(selection && selection.set && selection.set.playRandom && !(playlist && playlist.length > 1)) {
        dispatch(addRandomToPlaylist());
    }
};

export const clearPlaylist = () => (dispatch, getState) => {
    dispatch({type: CLEAR_PLAYLIST});
    const { selection } = getState();
    if(selection && selection.set && selection.set.playRandom) {
        dispatch(addRandomToPlaylist());
    }
};

export const addRandomToPlaylist = () => (dispatch, getState) => {
    const entry = getRandomSong(getState());
    if(entry) {
        dispatch(addToPlaylist(entry.artist, entry.album, entry.songs));
    }
};
