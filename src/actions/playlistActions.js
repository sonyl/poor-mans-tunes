export const ADD_TO_PLAYLIST = 'ADD_TO_PLAYLIST';
export const REMOVE_FROM_PLAYLIST = 'REMOVE_FROM_PLAYLIST';
export const CLEAR_PLAYLIST = 'CLEAR_PLAYLIST';

export const addToPlaylist = (artistIndex, albumIndex, songIndex, top=false) => ({
    type: ADD_TO_PLAYLIST,
    artistIndex,
    albumIndex,
    songIndex,
    top
});

export const removeFromPlaylist = (index) => ({
    type: REMOVE_FROM_PLAYLIST,
    index
});

export const clearPlaylist = (index) => ({
    type: CLEAR_PLAYLIST
});