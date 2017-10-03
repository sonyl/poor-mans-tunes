/* @flow */
import {fetchLastFm} from './actionUtils';
import { REQUEST_ARTIST, RECEIVE_ARTIST, REQUEST_ALBUM, RECEIVE_ALBUM } from './actionKeys';
import getConfig from '../config';

import type { Dispatch, GetState, LastFmInfo } from '../types';

export type RequestArtist = { type: 'REQUEST_ARTIST', artist: string };
export type ReceiveArtist = { type: 'RECEIVE_ARTIST', artist: string, lastFmInfo: ?LastFmInfo, receivedAt: number, error: any };
export type RequestAlbum = { type: 'REQUEST_ALBUM', artist: string, album: string };
export type ReceiveAlbum = { type: 'RECEIVE_ALBUM', artist: string, album: string, lastFmInfo: ?LastFmInfo,
    receivedAt: number, error: any };

const { skipLastFmArtist, skipLastFmAlbum  } = getConfig({skipLastFmArtist: false, skipLastFmAlbum: false});


/* ============ artist actions =================*/
const requestArtist = (artist: string): RequestArtist => ({
    type: REQUEST_ARTIST,
    artist
});

const receiveArtist = (artist: string, lastFmInfo: ?LastFmInfo, error: any): ReceiveArtist => ({
    type: RECEIVE_ARTIST,
    artist,
    lastFmInfo: lastFmInfo,
    error: error && (error.message || error),
    receivedAt: Date.now()
});


export const requestArtistIfNotExists = (artist: string) => (dispatch: Dispatch, getState: GetState): Promise<any> => {
    if(!artist) {
        return Promise.reject(new Error('required argument \'artist\' missing'));
    }

    const lastFm = getState().lastFm;
    if(lastFm && lastFm[artist] && lastFm[artist].__ARTIST_INFO) {
        return Promise.resolve(lastFm[artist]);
    }

    dispatch(requestArtist(artist));
    if(skipLastFmArtist) {
        dispatch(receiveArtist(artist, null, 'switched off'));
        return Promise.resolve();
    }

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
            dispatch(receiveArtist(artist, null, e));
        });
};


/* ============ album actions =================*/
export const requestAlbum = (artist: string, album: string): RequestAlbum => ({
    type: REQUEST_ALBUM,
    artist,
    album
});

const receiveAlbum = (artist: string, album: string, lastFmInfo: ?LastFmInfo, error): ReceiveAlbum => ({
    type: RECEIVE_ALBUM,
    artist,
    album,
    lastFmInfo,
    error: error && (error.message || error),
    receivedAt: Date.now()
});

export const requestAlbumIfNotExists = (artist: string, album: string) => (dispatch: Dispatch, getState: GetState): Promise<any> => {
    if(!artist || !album) {
        return Promise.reject(new Error('required argument \'artist\' or \'album\' missing'));
    }

    const lastFm = getState().lastFm;

    if(lastFm && lastFm[artist] && lastFm[artist][album]) {
        return Promise.resolve(lastFm[artist][album]);
    }

    dispatch(requestAlbum(artist, album));

    if(skipLastFmAlbum) {
        dispatch(receiveAlbum(artist, album, null, 'switched off'));
        return Promise.resolve();
    }

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
            dispatch(receiveAlbum(artist, album, null, e));
        });
};