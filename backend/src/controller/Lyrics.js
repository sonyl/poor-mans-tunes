/* @flow */
import fetch from 'node-fetch';
import lyrics from 'lyric-get';

const LYRICS_API = 'http://lyrics.wikia.com/api.php';
import type { Lyrics } from '../types';

const addRequestParams = (baseUrl: string, params: { [string]: string }): string => {

    const keys = Object.keys(params);
    if(keys.length) {
        const query = keys
            .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
            .join('&');

        return baseUrl.endsWith('/') ? (baseUrl + '?' + query) : (baseUrl + '/?' + query);
    }
    return baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
};

const getLyrics = (artist: string, song: string): Promise<Lyrics> => {
    return fetch(addRequestParams(LYRICS_API, {action: 'lyrics', artist, song, fmt:'json', func:'getSong'}))
        .then(response => {
            if(!response.ok) {
                throw new Error(`Response from "${LYRICS_API}" is: ${response.statusText}`);
            }
            const contentType = response.headers.get('content-type');
            if(contentType && contentType.startsWith('application/javascript')) {
                return response.json();
            } else if (contentType && contentType.startsWith('text/javascript')) {
                return response.text().then(fixJson);
            } else {
                throw new Error(`Response from "${LYRICS_API}" has unexpected "content-type"`);
            }
        }).then(song => {
            if(song && song.artist && song.song) {
                return song;
            }
            throw new Error(`Response from "${LYRICS_API}" has unknown structure: ` + JSON.stringify(song));
        }).then(({artist, song}) =>{
            return new Promise((resolve, reject) => {
                lyrics.get(artist, song, (err, res) => err ? reject(err) : resolve({lyrics: res, artist, song}));
            });
        });
};

// returned format is "song = {\n'song': 'xyz',\n'lyrics':'he said: \"let\\'s go home\"'"
// which is unfortunately invalid json (jsonp?), try to convert to valid json
const fixJson = (text) => {
    if(text.startsWith('song = {')) {
        const trimmed = text.substr(7);
        const fixed = trimmed.replace(/['"\\]/g, (match, offset, string) => {
            if(match === '\'' && offset > 0 && string[offset-1] === '\\') {
                return '\''; // special treatment for '\\': do not convert the '\''
            }
            // replace '\\' by '', '"' by '\'' and '\'' by '"'
            return match === '\\' ? '' : match === '\'' ? '"' : '\'';
        });
        return JSON.parse(fixed);
    }
};


const LyricsController = {
    get: (req: express$Request, res: express$Response) => {
        const {artist, song} = req.params;
        console.log('lyrics requested: %s --- %s', artist, song);
        getLyrics(req.params.artist, req.params.song)
            .then(lyrics => {
                console.log('lyrics received: %j', lyrics);
                res.json(lyrics);

            })
            .catch(err => {
                console.log('lyrics error: %j', err);
                if (err === 'not found') {
                    res.status(404).json({error: err});
                } else {
                    res.status(500).json({error: err.message || err});
                }
            });
    }
};

export default LyricsController;

