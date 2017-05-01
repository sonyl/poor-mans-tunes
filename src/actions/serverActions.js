import { REQUEST_SERVER_STATUS, RECEIVE_SERVER_STATUS, REQUEST_RESCAN_FILES,
    REQUEST_SERVER_SETTINGS, RECEIVE_SERVER_SETTINGS } from './actionKeys';

import { replaceRequestPlaceholders } from './utils';

const GETSTATUS_URL = '/api/status';
const GETSETTINSG_URL = '/api/settings';
const UPDATESETTINSG_URL = '/api/settings/${key}';
const RESCAN_FILES_URL = '/api/status/rescan';

/* ============ status actions =================*/

const receiveServerStatus = (status, error) => ({
    type: RECEIVE_SERVER_STATUS,
    status,
    error: error && (error.message || error),
    receivedAt: Date.now()
});

export const requestServerStatus = () => (dispatch, getState) => {
    const status = getState();
    if(!status.server.status.isFetching) {
        dispatch({
            type: REQUEST_SERVER_STATUS
        });
        return fetch(GETSTATUS_URL)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Error fetching data: ' + response.statusText);
                }
            }).then(json => {
                dispatch(receiveServerStatus(json));
            }).catch(error => {
                dispatch(receiveServerStatus(null, error));
            });
    }
};

/* ============ settings actions =================*/
const receiveServerSettings = (settings, error) => ({
    type: RECEIVE_SERVER_SETTINGS,
    settings,
    error: error && (error.message || error),
    receivedAt: Date.now()
});

export const requestServerSettings = () => (dispatch, getState) => {
    const status = getState();
    if(!status.server.settings.isFetching) {
        dispatch({
            type: REQUEST_SERVER_SETTINGS
        });
        return fetch(GETSETTINSG_URL)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Error fetching data: ' + response.statusText);
                }
            }).then(json => {
                dispatch(receiveServerSettings(json));
            }).catch(error => {
                dispatch(receiveServerSettings(null, error));
            });
    }
};

export const updateServerSettings = (key, value) => dispatch => {
    if(!key || !value) {
        throw new Error('please provide key and value');
    }
    console.log('updateServerSettings: key=%s, value=%s', key, value);
    return fetch(replaceRequestPlaceholders(UPDATESETTINSG_URL, {key, value}),
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({value})
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error fetching data: ' + response.statusText);
            }
        }).then(json => {
            dispatch(receiveServerSettings(json));
        }).catch(error => {
            //do nothing
        });
};

export const requestRescanFiles = () => (dispatch, getState) => {
    return fetch(RESCAN_FILES_URL, {method: 'PUT'})
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error fetching data: ' + response.statusText);
            }
        }).then(json => {
            console.log('Successfull response from server:', json);
        }).catch(error => {
            console.log('Error response from server:', error);
        });
};

