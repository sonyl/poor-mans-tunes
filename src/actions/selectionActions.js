import { SELECT_ARTIST, UNSELECT_ARTIST, SELECT_ALBUM, UNSELECT_ALBUM } from './actionKeys';
import { requestArtistIfNotExists, requestAlbumIfNotExists} from './lastFmActions';


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
    return dispatch(requestArtistIfNotExists(name));
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


