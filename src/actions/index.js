import {fetchLastFm} from './utils';
export const REQUEST_ALBUMS = 'REQUEST_ALBUMS';
export const RECEIVE_ALBUMS = 'RECEIVE_ALBUMS';
export const INVALIDATE_ALBUMS = 'INVALIDATE_ALBUMS';
export const SELECT_ARTIST = 'SELECT_ARTIST';
export const REQUEST_ARTIST = 'REQUEST_ARTIST';
export const RECEIVE_ARTIST = 'RECEIVE_ARTIST';
export const INVALIDATE_ARTIST = 'INVALIDATE_ARTIST';
export const SELECT_ALBUM = 'SELECT_ALBUM';
export const REQUEST_ALBUM = 'REQUEST_ALBUM';
export const RECEIVE_ALBUM = 'RECEIVE_ALBUM';
export const INVALIDATE_ALBUM = 'INVALIDATE_ALBUM';
export const SELECT_SONG = 'SELECT_SONG';

export const requestAlbums = () => ({
    type: REQUEST_ALBUMS
});

export const invalidateAlbums = () => ({
    type: INVALIDATE_ALBUMS
});

export const receiveAlbums = (artists, error) => ({
    type: RECEIVE_ALBUMS,
    artists:  artists,
    error: error && (error.message || error),
    receivedAt: Date.now()
});

export const fetchAllAlbums = () => dispatch => {
    const url = '/public/files.json';

    dispatch(requestAlbums());

    return fetch(url)
        .then(response => {
            if(response.ok) {
                return response.json();
            } else {
                throw new Error('Error fetching data: ' + response.statusText);
            }
        }).then(json => {
            console.log('parsed json', json);
            dispatch(receiveAlbums(json));
        }).catch(e => {
            console.log('parsing failed', e);
            dispatch(receiveAlbums([], e));
        });
};

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

    const {currentArtist, currentAlbum} = getState();
    if(currentArtist.index >= 0) {
        dispatch(invalidateArtist(currentArtist.index));
        if(currentAlbum.index >= 0) {
            dispatch(invalidateAlbum(currentAlbum.index));
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

    const {currentArtist, currentAlbum} = getState();
    if(currentAlbum.index != index) {
        console.log('dispatching:', INVALIDATE_ALBUM);
        dispatch(invalidateAlbum(currentAlbum.index));
    }
    dispatch(selectAlbum(index, album));
    dispatch(requestAlbum(index, album.album));

    return fetchLastFm('album.getinfo', {artist:currentArtist.name, album: album.album, autocorrect: '1'})
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

export const selectSong = (index, name, song) => ({
    type: SELECT_SONG,
    index,
    name,
    song
});