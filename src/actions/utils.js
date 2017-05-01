import {lastFmApi} from '../credentials';
import getConfig from '../config';

const { lastFmBase } = getConfig({lastFmBase: 'http://ws.audioscrobbler.com/2.0/'});

const DO_NOT_FETCH = false;

export function replaceRequestPlaceholders (templ, params) {
    const regExp = new RegExp('\\$\\{(.*?)\\}');  // *? means non-greedy, we do not use 'g' flag intentionally
    let match;
    while ((match = regExp.exec(templ)) != null) {
        templ = templ.substring(0, match.index) + (params[match[1]] || '') + templ.substring(match.index + match[0].length);
    }
    return templ;
}

export function addRequestParams(baseUrl, params) {

    const esc = encodeURIComponent;
    const query = Object.keys(params)
        .map(k => esc(k) + '=' + esc(params[k]))
        .join('&');

    return baseUrl.endsWith('/') ? (baseUrl + '?' + query) : (baseUrl + '/?' + query);
}

export const fetchLastFm = (method, args) => {
    const params = {
        api_key: lastFmApi,
        format: 'json',
        method,
        ...args
    };

    if (DO_NOT_FETCH) {
        return Promise.reject(new Error('Fetching is disabled'));
    }

    return fetch(addRequestParams(lastFmBase, params));
};
