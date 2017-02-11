import { addRandomSongToPlaylistIfNecessary } from './playlistActions';
import { SET_PLAY_RANDOM, SET_VOLUME } from './actionKeys';


/* ============ set actions =================*/
const _setPlayRandom = playRandom => ({
    type: SET_PLAY_RANDOM,
    playRandom
});

export const setPlayRandom = playRandom => (dispatch, getState) => {
    dispatch(_setPlayRandom(playRandom));
    dispatch(addRandomSongToPlaylistIfNecessary());
};

export const setVolume = volume => ({
    type: SET_VOLUME,
    volume
});