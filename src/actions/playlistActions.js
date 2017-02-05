import { getRandomSong, isPlaylistEmpty, isSetInSettings } from '../reducers';
import { ADD_SONG_TO_PLAYLIST, REMOVE_SONG_FROM_PLAYLIST, CLEAR_PLAYLIST, MOVE_SONG_TO_POSITION } from './actionKeys';


export const addSongsToPlaylist = (artist, album, songs, top=false) => ({
    type: ADD_SONG_TO_PLAYLIST,
    artist,
    album,
    songs: Array.isArray(songs) ? songs : [songs],
    top
});

export const removeSongAtIndexFromPlaylist = index => dispatch => {
    dispatch({
        type: REMOVE_SONG_FROM_PLAYLIST,
        index
    });
    dispatch(addRandomSongToPlaylistIfNecessary());
};

export const clearPlaylist = () => (dispatch) => {
    dispatch({type: CLEAR_PLAYLIST});
    dispatch(addRandomSongToPlaylistIfNecessary());
};

export const addRandomSongToPlaylistIfNecessary = () => (dispatch, getState) => {
    const state = getState();
    if(isSetInSettings(state, 'playRandom') && isPlaylistEmpty(state)) {
        const randomSong = getRandomSong(state);
        if (randomSong) {
            dispatch(addSongsToPlaylist(randomSong.artist, randomSong.album, randomSong.songs));
        }
    }
};


export const moveSongToPositionInPlaylist = (index, newIndex) => ({
    type: MOVE_SONG_TO_POSITION,
    index,
    newIndex
});
