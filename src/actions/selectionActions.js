import {fetchLastFm} from './utils';

export const SELECT_ARTIST = 'SELECT_ARTIST';
export const UNSELECT_ARTIST = 'UNSELECT_ARTIST';
export const REQUEST_ARTIST = 'REQUEST_ARTIST';
export const RECEIVE_ARTIST = 'RECEIVE_ARTIST';

export const SELECT_ALBUM = 'SELECT_ALBUM';
export const UNSELECT_ALBUM = 'UNSELECT_ALBUM';
export const REQUEST_ALBUM = 'REQUEST_ALBUM';
export const RECEIVE_ALBUM = 'RECEIVE_ALBUM';

/* ============ artist actions =================*/

export const selectArtist = (index, name) => ({
    type: SELECT_ARTIST,
    index,
    name
});

export const unselectArtist = () => ({
    type: UNSELECT_ARTIST
});

export const requestArtist = (index, name) => ({
    type: REQUEST_ARTIST,
    index,
    name
});

export const receiveArtist = (index, lastFmInfo, error) => ({
    type: RECEIVE_ARTIST,
    index,
    lastFmInfo,
    error: error && (error.message || error),
    receivedAt: Date.now()
});

export const selectNewArtist = (index, artist) => (dispatch) => {

    dispatch(selectArtist(index, artist));
    dispatch(requestArtist(index, artist));

    return fetchLastFm('artist.getcorrection', {artist})
        .then(response => {
            if(!response.ok) {
                throw new Error(`api call returned: ${response.statusText}`);
            }
            return response.json();
        })
        .then(json => {
            console.log('Response-json', json);
            if(json.corrections && json.corrections.correction && json.corrections.correction.artist
                && json.corrections.correction.artist.name) {
                return json.corrections.correction.artist.name;
            }
            throw new Error(`no correction found for: ${artist}`);
        })
        .then(artist => fetchLastFm('artist.getInfo', {artist}))
        .then(response => {
            if(!response.ok) {
                throw new Error(`api call returned: ${response.statusText}`);
            }
            return response.json();
        })
        .then(json => {
            console.log('Response-json', json);
            dispatch(receiveArtist(index, json.artist));
        })
        .catch(e => {
            console.log('Error occured', e);
            dispatch(receiveArtist(index, {}, e));
        });
};


/* ============ album actions =================*/
export const selectAlbum = (index, album) => ({
    type: SELECT_ALBUM,
    index,
    name: album.album,
    album
});

export const requestAlbum = (index, name) => ({
    type: REQUEST_ALBUM,
    index,
    name
});

export const receiveAlbum = (index, lastFmInfo, error) => ({
    type: RECEIVE_ALBUM,
    index,
    lastFmInfo,
    error: error && (error.message || error),
    receivedAt: Date.now()
});

export const unselectAlbum = () => ({
    type: UNSELECT_ALBUM
});

export const selectNewAlbum = (index, album) => (dispatch, getState) => {

    const {selection} = getState();
    dispatch(selectAlbum(index, album));
    dispatch(requestAlbum(index, album.album));

    return fetchLastFm('album.getinfo', {artist:selection.artist.name, album: album.album, autocorrect: '1'})
        .then(response => {
            if(!response.ok) {
                throw new Error(`api call returned: ${response.statusText}`);
            }
            return response.json();
        })
        .then(json => {
            console.log('Response-json', json);
            dispatch(receiveAlbum(index, json.album));
        })
        .catch(e => {
            console.log('Error during "album.getinfo":', e);
            dispatch(receiveAlbum(index, {}, e));
        });
};


