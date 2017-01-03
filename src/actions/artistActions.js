import {fetchLastFm} from './utils';
import {invalidateAlbum} from './albumActions';

export const SELECT_ARTIST = 'SELECT_ARTIST';
export const REQUEST_ARTIST = 'REQUEST_ARTIST';
export const RECEIVE_ARTIST = 'RECEIVE_ARTIST';
export const INVALIDATE_ARTIST = 'INVALIDATE_ARTIST';

export const selectArtist = (index, name) => ({
    type: SELECT_ARTIST,
    index,
    name
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

export const invalidateArtist = (index) => ({
    type: INVALIDATE_ARTIST,
    index
});

export const selectNewArtist = (index, artist) => (dispatch, getState) => {

    const {selectedArtist, selectedAlbum} = getState();
    if(selectedArtist.index >= 0) {
        dispatch(invalidateArtist(selectedArtist.index));
        if(selectedAlbum.index >= 0) {
            dispatch(invalidateAlbum(selectedAlbum.index));
        }
    }
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

