import {lastFmApi} from '../credentials';

const lastFmBase = 'http://ws.audioscrobbler.com/2.0/';


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

    return fetch(buildUrl(lastFmBase, params));
};
