import _sanitizeHtml from 'sanitize-html';
import getConfig from '../config';

const {contextRoot = ''} = getConfig();

function sanitize(dirty) {
    return _sanitizeHtml(dirty, {
        transformTags: {
            a: _sanitizeHtml.simpleTransform('a', {target: '_blank'})
        }
    });
}

export const sanitizeHtml = dirty => ({__html: sanitize(dirty)});

export const createLinkUrl = (artist, album) => {
    return album ? `${contextRoot}/app/${artist}/${album}` : `${contextRoot}/app/${artist}`;
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