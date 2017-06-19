/* @flow */
import { SEND_NOTIFICATION, DISMISS_NOTIFICATION } from './actionKeys';
import type { Alert, AlertType } from '../types';

export type SendNotification = {
    type: 'SEND_NOTIFICATION',
    alert: Alert
}

export type DismissNotification = {
    type: 'DISMISS_NOTIFICATION',
    alert: Alert
}

const sendNotify = (type: AlertType = 'info', headline: string, message?: string): SendNotification => ({
    type: SEND_NOTIFICATION,
    alert: {
        id:  (new Date()).getTime(),
        type,
        message: message || headline,
        headline: message && headline
    }
});

export const sendNotification = (headline: string, message: string) => sendNotify('info', headline, message);
export const sendInfoNotification = (headline: string, message: string) => sendNotify('info', headline, message);
export const sendWarningNotification = (headline: string, message: string) => sendNotify('warning', headline, message);
export const sendDangerNotification = (headline: string, message: string) => sendNotify('danger', headline, message);
export const sendSuccessNotification = (headline: string, message: string) => sendNotify('success', headline, message);

export const dismissNotification = (alert: Alert): DismissNotification => ({
    type: DISMISS_NOTIFICATION,
    alert
});

