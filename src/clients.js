import {lastFmApi} from 'credentials';

const baseUrl = 'http://www';

const lastFmBase = 'http://ws.audioscrobbler.com/2.0/';

export function createMp3Url(part) {
    if(part) {
        return baseUrl + part;
    }
    return null;
}

export function getAlbumIndex() {

    const url = 'public/files.json';

    return fetch(url)
        .then(response => response.json())
        .then(json => {
            console.log('parsed json', json);
            return json;
        }).catch(e => {
            console.log('parsing failed', e);
        });
}

export function getLastFmArtistInfo(artist) {
    'use strict';

    const params = {
        method:  'artist.getinfo',
        api_key: lastFmApi,
        artist:  artist,
        format:  'json'
    };

    const url = buildUrl(lastFmBase, params);
    return fetch(url)
        .then(response => response.json())
        .then(json => {
            console.log('Response-json', json);
            return json.artist;
        }).catch(e => {
            console.log('parsing failed', e);
        });
}


export function getLastFmAlbumInfo(artist, album) {
    const params = {
        method:  'album.getinfo',
        api_key: lastFmApi,
        artist:  artist,
        album:   album,
        autocorrect: '1',
        format:  'json'
    };

    const url = buildUrl(lastFmBase, params);
    return fetch(url)
        .then(response => response.json())
        .then(json => {
            console.log('Response-json', json);
            return json.album;
        }).catch(e => {
            console.log('parsing failed', e);
        });
}

function buildUrl(baseUrl, params) {
    'use strict';

    const esc = encodeURIComponent;
    const query = Object.keys(params)
        .map(k => esc(k) + '=' + esc(params[k]))
        .join('&');

    return baseUrl.endsWith('/') ? (baseUrl + '?' + query) : (baseUrl + '/?' + query);
}
