/* @flow */
import _sanitizeHtml from 'sanitize-html';
import getConfig from '../config';

import type { Album, LastFmInfo } from '../types';

const { baseUrl=''} = getConfig();

declare class Notification {
    constructor(title: string, options: {
        dir?: 'auto' | 'ltr' | 'rtl',
        lang?: string,
        body?: string,
        tag?: string,
        icon?: string,
        data?: mixed
    }): Notification;

    close(): void;
    static requestPermission(): Promise<string>;
}

function sanitize(dirty) {
    return _sanitizeHtml(dirty, {
        transformTags: {
            a: _sanitizeHtml.simpleTransform('a', {target: '_blank'})
        }
    });
}

export const sanitizeHtml = (dirty: string): {__html: string} => ({__html: sanitize(dirty)});

export const createLinkUrl = (artist: string, album?: ?string) => {
    return album ? `/app/${artist}/${album}` : `/app/${artist}`;
};

const notify = (title: string, body: string, icon: ?string) => {
    const options = {};
    options.body = body;
    if(icon) {
        options.icon = icon;
    }
    const n = new Notification(title, options);
    setTimeout(n.close.bind(n), 5000);
};

export const sendDesktopNotification = (title: string, body: string, icon: ?string) => {
    if (!('Notification' in window)) {
        console.log('This browser does not support desktop notifications: ', title, body);
        return;
    }

    if (!('hidden' in document)) {
        console.log('This browser does not support document.hidden, we don\'t know if application window is hidden: ', title, body);
        return;
    }

    if(!document.hidden) {
        console.log('The application window is visible, we do not need to send notifications: ', title, body);
        return;
    }


    // Let's check whether notification permissions have already been granted
    if (Notification.permission === 'granted') {
        // If it's okay let's create a notification
        notify(title, body, icon);
    } else if (Notification.permission !== 'denied') {
        // Otherwise, we need to ask the user for permission
        Notification.requestPermission().then(permission => {
            // If the user accepts, let's create a notification
            if (permission === 'granted') {
                notify(title, body, icon);
            }
        });
    }
};

export const LASTFM_IMG_SIZE_SMALL = 0;
export const LASTFM_IMG_SIZ_MEDIUM = 1;
export const LASTFM_IMG_SIZE_LARGE = 2;
export const LASTFM_IMG_SIZE_XLARGE = 3;
export const LASTFM_IMG_SIZE_MEGA = 4;
export const LASTFM_IMG_SIZE_ULTRA = 5;

export const getLastFmThumbnail = (lastFmInfo: LastFmInfo, maxSize: number=LASTFM_IMG_SIZE_ULTRA) => {
    const image = lastFmInfo && lastFmInfo.image;
    if(image) {
        let size = maxSize + 1;
        while(--size >= 0) {
            if (image[size] && image[size]['#text'] && image[size]['#text'].length > 0) {
                return image[size]['#text'];
            }
        }
    }
    return null;
};

export const getCoverUrl = (album: Album) => {
    // const coverUrl = album && album.coverUrl;
    // return coverUrl ? baseUrl + coverUrl : null;
    const audioSrc = album && album.picture && (album.picture.src || album.picture.img);
    return audioSrc ? baseUrl + '/img' + audioSrc : null;
};

export const createAudioUrls = (partUrls: string | string[]) => {
    const cvrt = partUrl => !partUrl ? partUrl : baseUrl + '/audio' + partUrl;

    return !partUrls ? partUrls : Array.isArray(partUrls) ? partUrls.map(cvrt) : cvrt(partUrls);
};

type LogFunction = (method: string, format: string, ...args: any)=>void;
export function createLog(enabled: boolean, component: string): LogFunction {
    function log (method: string, fmt: string='', ...args: any) {
        if(!args) args = [];
        console.log(`${component}.${method}() ${fmt}`, ...args);
    }
    return enabled ? log : function () {};
}

/**
 *
 * @param url {string or array}
 * @param newUrl {string or arry}
 * @returns {boolean} if both are equal
 */
export const urlsEqual = (url: string | string[], newUrl: string | string[]) => {
    // if this one of the array is a falsy value, return true if the other is also falsy, false otherwise
    if (!url || !newUrl) {
        return !!url === !!newUrl;
    }

    // at least one of the arguments isn't an array compare
    if (!Array.isArray(url) || ! Array.isArray(newUrl)) {
        return url === newUrl;
    }

    // compare lengths - can save a lot of time
    if(url.length != newUrl.length) {
        return false;
    }

    return !url.find((u, i) => {
        return u !== newUrl[i];
    });
};