export const ADD_TO_PLAYLIST = 'ADD_TO_PLAYLIST';
export const REMOVE_FROM_PLAYLIST = 'REMOVE_FROM_PLAYLIST';

export const addToPlaylist = (artistIndex, albumIndex, songIndex) => ({
    type: ADD_TO_PLAYLIST,
    artistIndex,
    albumIndex,
    songIndex
});

export const removeFromPlaylist = (index) => ({
    type: REMOVE_FROM_PLAYLIST,
    index
});