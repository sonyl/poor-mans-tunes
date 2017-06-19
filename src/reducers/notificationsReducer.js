/* @flow */
import { SEND_NOTIFICATION, DISMISS_NOTIFICATION } from '../actions/actionKeys';
import type { Action, Alert } from '../types';

export type NotificationsState = Alert[];

const notifications = (state: NotificationsState = [], action: Action) => {
    switch (action.type) {
        case SEND_NOTIFICATION: {
            return [
                ...state,
                action.alert
            ];
        }
        case DISMISS_NOTIFICATION: {
            // find the index of the alert that was dismissed
            const idx = state.indexOf(action.alert);
            if (idx >= 0) {
                return [
                    ...state.slice(0, idx),
                    ...state.slice(idx + 1)
                ];
            }
        }
    }
    return state;
};

export default notifications;
