/* @flow */
import {lastFmApi} from '../credentials';
import getConfig from '../config';

const { lastFmBase } = getConfig({lastFmBase: 'http://ws.audioscrobbler.com/2.0/'});

const DO_NOT_FETCH = false;

export function replaceRequestPlaceholders (templ: string, params: {[string]: string}): string {
    const regExp = new RegExp('\\$\\{(.*?)\\}');  // *? means non-greedy, we do not use 'g' flag intentionally
    let match;
    while ((match = regExp.exec(templ)) != null) {
        templ = templ.substring(0, match.index) + (params[match[1]] || '') + templ.substring(match.index + match[0].length);
    }
    return templ;
}

export function addRequestParams(baseUrl: string, params: ?{[string]: string}): string {

    if(params !== null && typeof params === 'object') {
        const savedParams = params; // make flow happy
        const keys = Object.keys(params);
        if(keys.length) {
            const query = keys.map(k => encodeURIComponent(k) + '=' + encodeURIComponent(savedParams[k])).join('&');
            return baseUrl.endsWith('/') ? (baseUrl + '?' + query) : (baseUrl + '/?' + query);
        }
    }
    return baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
}

export const fetchLastFm = (method: string, args: Object): Promise<any> => {
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
