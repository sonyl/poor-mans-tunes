import {lastFmApi} from 'credentials';

const baseUrl = 'http://www';

export function createMp3Url(part) {
    if(part) {
        return baseUrl + part;
    }
    return null;
}

export function getAlbumIndex() {

    const url = 'public/files-full.json';

    return fetch(url)
        .then(response => response.json())
        .then(json => {
            console.log('parsed json', json);
            return json;
        }).catch(e => {
            console.log('parsing failed', e)
        });
}


export function getLastFMInfo(artist, album) {
    const params = {
        method:  "album.getinfo",
        api_key: lastFmApi,
        artist:  artist,
        album:   album,
        autocorrect: "1",
        format:  "json"
    };

    const esc = encodeURIComponent;
    const query = Object.keys(params)
        .map(k => esc(k) + '=' + esc(params[k]))
        .join('&');

    const url = "http://ws.audioscrobbler.com/2.0/?" + query;
    return fetch(url)
        .then(response => response.json())
        .then(json => {
            console.log("Response-json", json);
            return json.album;
        }).catch(e => {
            console.log('parsing failed', e);
        })
}
