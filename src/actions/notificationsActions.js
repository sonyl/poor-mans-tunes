import { SEND_NOTIFICATION, DISMISS_NOTIFICATION } from './actionKeys';

const sendNotify = (type = 'info', headline, message) => ({
    type: SEND_NOTIFICATION,
    alert: {
        id:  (new Date()).getTime(),
        type,
        message: message || headline,
        headline: message && headline
    }
});
export const sendNotification = (headline, message) => sendNotify('info', headline, message);
export const sendInfoNotification = (headline, message) => sendNotify('info', headline, message);
export const sendWarningNotification = (headline, message) => sendNotify('warning', headline, message);
export const sendDangerNotification = (headline, message) => sendNotify('danger', headline, message);
export const sendSuccessNotification = (headline, message) => sendNotify('success', headline, message);

export const dismissNotification = alert => ({
    type: DISMISS_NOTIFICATION,
    alert
});

