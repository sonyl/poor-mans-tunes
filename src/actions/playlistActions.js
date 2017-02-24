import { getRandomSong, getRandomAlbumSongs, isPlaylistEmpty, isSetInSettings } from '../reducers';
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
    dispatch(addRandomSongsToPlaylistIfNecessary());
};

export const clearPlaylist = () => (dispatch) => {
    dispatch({type: CLEAR_PLAYLIST});
    dispatch(addRandomSongsToPlaylistIfNecessary());
};

export const addRandomSongsToPlaylistIfNecessary = () => (dispatch, getState) => {
    const state = getState();
    if(isPlaylistEmpty(state)) {
        if (isSetInSettings(state, 'playRandomSong')) {
            const randomSong = getRandomSong(state);
            if (randomSong) {
                dispatch(addSongsToPlaylist(randomSong.artist, randomSong.album, randomSong.songs));
            }
        } else if (isSetInSettings(state, 'playRandomAlbum')) {
            const randomAlbumSongs = getRandomAlbumSongs(state);
            if (randomAlbumSongs) {
                dispatch(addSongsToPlaylist(randomAlbumSongs.artist, randomAlbumSongs.album, randomAlbumSongs.songs));
            }
        }
    }
};

export const moveSongToPositionInPlaylist = (index, newIndex) => ({
    type: MOVE_SONG_TO_POSITION,
    index,
    newIndex
});
