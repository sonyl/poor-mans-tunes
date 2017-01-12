import {lastFmApi} from '../credentials';

const lastFmBase = 'http://ws.audioscrobbler.com/2.0/';

const DO_NOT_FETCH = true;


function buildUrl(baseUrl, params) {

    const esc = encodeURIComponent;
    const query = Object.keys(params)
        .map(k => esc(k) + '=' + esc(params[k]))
        .join('&');

    return baseUrl.endsWith('/') ? (baseUrl + '?' + query) : (baseUrl + '/?' + query);
}


export const fetchLastFm = (method, args) => {
    const params = {
        api_key: lastFmApi,
        format:  'json',
        method,
        ...args
    };

    if(DO_NOT_FETCH) {
        return Promise.reject(new Error('Fetching is disabled'));
    }

    return fetch(buildUrl(lastFmBase, params));
};
