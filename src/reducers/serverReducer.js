/* @flow */
import { REQUEST_SERVER_STATUS, RECEIVE_SERVER_STATUS, REQUEST_SERVER_SETTINGS, RECEIVE_SERVER_SETTINGS } from '../actions/actionKeys';
import type { Action } from '../types';

export type ServerState = {
    status: { isFetching: boolean, status?: any, error?: any, lastUpdated?: number},
    settings: {isFetching: boolean, settings?: any, error?: any, lastUpdated?: number}
}

const defaultState: ServerState = {status: {isFetching: false}, settings: {isFetching: false}};

const server = (state: ServerState = defaultState, action: Action) => {
    switch (action.type) {
        case REQUEST_SERVER_STATUS:
            return {
                ...state,
                status: {
                    ...state.status,
                    isFetching: true
                }
            };
        case RECEIVE_SERVER_STATUS: {
            // TODO: reorganize state
            const prevCollection = state.status && state.status.status && state.status.status.collection;
            if (action.status && !action.status.collection && state.status && prevCollection) {
                action.status.collection = prevCollection;
            }
            return {
                ...state,
                status: {
                    isFetching: false,
                    lastUpdated: action.receivedAt,
                    status: action.status,
                    error: action.error
                }
            };
        }
        case REQUEST_SERVER_SETTINGS:
            return {
                ...state,
                settings: {
                    ...state.settings,
                    isFetching: true
                }
            };
        case RECEIVE_SERVER_SETTINGS:
            return {
                ...state,
                settings: {
                    isFetching: false,
                    lastUpdated: action.receivedAt,
                    settings: action.settings,
                    error: action.error
                }
            };
    }
    return state;
};

export default server;

// ------------ selectors

export const getStatus = (state: ServerState) => {
    const {status, error, lastUpdated} = state.status;
    return {status, error, lastUpdated};
};

export const getSettings = (state: ServerState) => {
    const { settings, error, lastUpdated } = state.settings;
    return { settings, error, lastUpdated };
};


