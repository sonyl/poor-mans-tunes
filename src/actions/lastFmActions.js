import {fetchLastFm} from './utils';
import { REQUEST_ARTIST, RECEIVE_ARTIST, REQUEST_ALBUM, RECEIVE_ALBUM } from './actionKeys';

/* ============ artist actions =================*/
const requestArtist = (artist) => ({
    type: REQUEST_ARTIST,
    artist
});

const receiveArtist = (artist, lastFmInfo, error) => ({
    type: RECEIVE_ARTIST,
    artist,
    lastFmInfo,
    error: error && (error.message || error),
    receivedAt: Date.now()
});


export const requestArtistIfNotExists = artist => (dispatch, getState) => {
    if(!artist) {
        return Promise.reject(new Error('required argument \'artist\' missing'));
    }

    const lastFm = getState().lastFm;
    if(lastFm && lastFm[artist] && lastFm[artist].__ARTIST_INFO) {
        return Promise.resolve(lastFm[artist]);
    }

    dispatch(requestArtist(artist));

    return fetchLastFm('artist.getcorrection', {artist})
        .then(response => {
            if(!response.ok) {
                throw new Error(`api call returned: ${response.statusText}`);
            }
            return response.json();
        })
        .then(json => {
            //console.log('Response-json', json);
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
            //console.log('Response-json', json);
            dispatch(receiveArtist(artist, json.artist));
        })
        .catch(e => {
            //console.log('Error occured', e);
            dispatch(receiveArtist(artist, {}, e));
        });
};


/* ============ album actions =================*/
const requestAlbum = (artist, album) => ({
    type: REQUEST_ALBUM,
    artist,
    album
});

const receiveAlbum = (artist, album, lastFmInfo, error) => ({
    type: RECEIVE_ALBUM,
    artist,
    album,
    lastFmInfo,
    error: error && (error.message || error),
    receivedAt: Date.now()
});


export const requestAlbumIfNotExists = (artist, album) => (dispatch, getState) => {
    if(!artist || !album) {
        return Promise.reject(new Error('required argument \'artist\' or \'album\' missing'));
    }

    const lastFm = getState().lastFm;

    if(lastFm && lastFm[artist] && lastFm[artist][album]) {
        return Promise.resolve(lastFm[artist][album]);
    }

    dispatch(requestAlbum(artist, album));

    return fetchLastFm('album.getinfo', {artist, album, autocorrect: '1'})
        .then(response => {
            if(!response.ok) {
                throw new Error(`api call returned: ${response.statusText}`);
            }
            return response.json();
        })
        .then(json => {
            //console.log('Response-json', json);
            dispatch(receiveAlbum(artist, album, json.album));
        })
        .catch(e => {
            //console.log('Error during "album.getinfo":', e);
            dispatch(receiveAlbum(artist, album, {}, e));
        });
};