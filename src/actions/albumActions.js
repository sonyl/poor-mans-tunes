import {fetchLastFm} from './utils';

export const SELECT_ALBUM = 'SELECT_ALBUM';
export const REQUEST_ALBUM = 'REQUEST_ALBUM';
export const RECEIVE_ALBUM = 'RECEIVE_ALBUM';
export const INVALIDATE_ALBUM = 'INVALIDATE_ALBUM';

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

export const invalidateAlbum = (index) => ({
    type: INVALIDATE_ALBUM,
    index
});

export const selectNewAlbum = (index, album) => (dispatch, getState) => {

    const {selectedArtist, selectedAlbum} = getState();
    if(selectedAlbum.index != index) {
        console.log('dispatching:', INVALIDATE_ALBUM);
        dispatch(invalidateAlbum(selectedAlbum.index));
    }
    dispatch(selectAlbum(index, album));
    dispatch(requestAlbum(index, album.album));

    return fetchLastFm('album.getinfo', {artist:selectedArtist.name, album: album.album, autocorrect: '1'})
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