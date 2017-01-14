import { requestArtistIfNotExists, requestAlbumIfNotExists} from './lastFmActions';
import { addRandomToPlaylist } from './playlistActions';

export const SELECT_ARTIST = 'SELECT_ARTIST';
export const UNSELECT_ARTIST = 'UNSELECT_ARTIST';

export const SELECT_ALBUM = 'SELECT_ALBUM';
export const UNSELECT_ALBUM = 'UNSELECT_ALBUM';

export const SET_PLAY_RANDOM = 'SET_PLAY_RANDOM';

/* ============ artist actions =================*/

const _selectArtist = (index, name) => ({
    type: SELECT_ARTIST,
    index,
    name
});

export const unselectArtist = () => ({
    type: UNSELECT_ARTIST
});


export const selectArtist = (index, name) => dispatch => {
    dispatch(_selectArtist(index, name));
    dispatch(requestArtistIfNotExists(name));
};

/* ============ album actions =================*/
const _selectAlbum = (index, name) => ({
    type: SELECT_ALBUM,
    index,
    name
});

export const unselectAlbum = () => ({
    type: UNSELECT_ALBUM
});


export const selectAlbum = (index, album) => dispatch => {
    dispatch(_selectAlbum(index, album.album));
    return dispatch(requestAlbumIfNotExists(album.artist, album.album));
};

/* ============ set actions =================*/
const _setPlayRandom = playRandom => ({
    type: SET_PLAY_RANDOM,
    playRandom
});

export const setPlayRandom = playRandom => (dispatch, getState) => {
    const {selection, playlist} = getState();
    dispatch(_setPlayRandom(playRandom));
    if(playRandom && !(selection && selection.set && selection.set.playRandom) && !(playlist && playlist.length > 0)) {
        dispatch(addRandomToPlaylist());
    }
};
