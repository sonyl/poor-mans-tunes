import { addRandomSongsToPlaylistIfNecessary } from './playlistActions';
import { SET_PLAY_RANDOM_SONG, SET_PLAY_RANDOM_ALBUM, SET_VOLUME } from './actionKeys';


const _setPlayRandomSong = playRandom => ({
    type: SET_PLAY_RANDOM_SONG,
    playRandom
});

const _setPlayRandomAlbum = playRandom => ({
    type: SET_PLAY_RANDOM_ALBUM,
    playRandom
});

export const setPlayRandomSong = playRandom => (dispatch, getState) => {
    dispatch(_setPlayRandomSong(playRandom));
    dispatch(addRandomSongsToPlaylistIfNecessary());
};

export const setPlayRandomAlbum = playRandom => (dispatch, getState) => {
    dispatch(_setPlayRandomAlbum(playRandom));
    dispatch(addRandomSongsToPlaylistIfNecessary());
};

export const setVolume = volume => ({
    type: SET_VOLUME,
    volume
});