import { REQUEST_SONG_LYRICS, RECEIVE_SONG_LYRICS } from './actionKeys';
import { replaceRequestPlaceholders} from './utils';

const GETLYRICS_URL = '/lyrics/${artist}/${song}';

const headers = new Headers({
    accept: 'application/json'
});

/* ============ artist actions =================*/
const requestSongLyrics = (artist, song) => ({
    type: REQUEST_SONG_LYRICS,
    artist,
    song
});

const receiveSongLyrics = (artist, song, lyrics, error) => ({
    type: RECEIVE_SONG_LYRICS,
    artist,
    song,
    lyrics,
    error: error && (error.message || error),
    receivedAt: Date.now()
});


export const requestSongLyricsIfNotExists = (artist, song) => (dispatch, getState) => {
    if(!artist || !song) {
        return Promise.reject(new Error('required argument \'artist\' or \'song\' missing'));
    }

    const lyrics = getState().lyrics;
    if(lyrics && lyrics[artist] && lyrics[artist][song]) {
        return Promise.resolve();
    }

    dispatch(requestSongLyrics(artist, song));

    return fetch(replaceRequestPlaceholders(GETLYRICS_URL, {artist, song}), {headers})
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then(json => {
                    throw new Error('Error fetching data: ' + response.statusText + ': ' + json.error);
                }, err => {
                    throw new Error('Error fetching data: ' + response.statusText);
                });
            }
        }).then(json => {
            console.log('received lyrics:', json);
            json.lyrics = json.lyrics.replace(/\n/g, '<br />');
            dispatch(receiveSongLyrics(artist, song, json));
            return;
        })
        .catch(e => {
            console.log('error fetching lyrics:', e);
            dispatch(receiveSongLyrics(artist, song, null, e));
            return;
        });
};
