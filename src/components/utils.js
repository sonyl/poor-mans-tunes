import _sanitizeHtml from 'sanitize-html';
import getConfig from '../config';

const { baseUrl=''} = getConfig();

function sanitize(dirty) {
    return _sanitizeHtml(dirty, {
        transformTags: {
            a: _sanitizeHtml.simpleTransform('a', {target: '_blank'})
        }
    });
}

export const sanitizeHtml = dirty => ({__html: sanitize(dirty)});

export const createLinkUrl = (artist, album) => {
    return album ? `/app/${artist}/${album}` : `/app/${artist}`;
};

const notify = (title, body, icon) => {
    const n = new Notification(title, {body, icon});
    setTimeout(n.close.bind(n), 5000);
};

export const sendNotification = (title, body, icon) => {
    if (!('Notification' in window)) {
        console.log('This browser does not support desktop notifications: ', title, body);
        return;
    }

    // Let's check whether notification permissions have already been granted
    if (Notification.permission === 'granted') {
        // If it's okay let's create a notification
        notify(title, body, icon);
    } else if (Notification.permission !== 'denied') {
        // Otherwise, we need to ask the user for permission
        Notification.requestPermission(function(permission) {
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

export const getLastFmThumbnail = (lastFmInfo, maxSize=LASTFM_IMG_SIZE_ULTRA) => {
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

export const getCoverUrl = album => {
    const coverUrl = album && album.coverUrl;
    return coverUrl ? baseUrl + coverUrl : null;
};

export const createMp3Url = (part) => {
    return part ? (baseUrl + part) : null;
};


export function createLog(enabled, component){
    function log (method, fmt='', ...args) {
        if(!args) args = [];
        console.log(`${component}.${method}() ${fmt}`, ...args);
    }
    return enabled ? log : function () {};

}
