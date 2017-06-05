import { REQUEST_SERVER_STATUS, RECEIVE_SERVER_STATUS, REQUEST_RESCAN_FILES,
    REQUEST_SERVER_SETTINGS, RECEIVE_SERVER_SETTINGS } from './actionKeys';

import { sendNotification, sendSuccessNotification, sendDangerNotification, dismissNotification } from './notificationsActions';
import { replaceRequestPlaceholders, addRequestParams } from './utils';

const GETSTATUS_URL = '/api/status';
const GETSETTINSG_URL = '/api/settings';
const UPDATESETTINSG_URL = '/api/settings/${key}';
const RESCAN_FILES_URL = '/api/status/rescan';
const SONOS_PLAY_URL = '/api/sonos/play';
const DEFAULT_HEADERS = { 'Accept': 'application/json' };

/* ============ status actions =================*/

const receiveServerStatus = (status, error) => ({
    type: RECEIVE_SERVER_STATUS,
    status,
    error: error && (error.message || error),
    receivedAt: Date.now()
});

export const requestServerStatus = (full = false) => (dispatch, getState) => {
    const status = getState();
    if(status.server.status.isFetching) {
        return Promise.resolve('isFetching');
    }

    dispatch({
        type: REQUEST_SERVER_STATUS
    });

    return fetch(addRequestParams(GETSTATUS_URL, full ? { full: 'full' } : null), {headers: DEFAULT_HEADERS})
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error fetching data: ' + response.statusText);
            }
        }).then(json => {
            dispatch(receiveServerStatus(json));
            return json;
        }).catch(error => {
            dispatch(receiveServerStatus(null, error));
            return error;
        });
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
        return fetch(GETSETTINSG_URL, {headers: DEFAULT_HEADERS})
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
    const sendNotificiation = sendNotification('Saving...', `updating: ${key}`);
    dispatch(sendNotificiation);
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
            dispatch(dismissNotification(sendNotificiation.alert));
            dispatch(sendSuccessNotification('Saving...', `${key} sucessfully saved`));
        }).catch(error => {
            dispatch(dismissNotification(sendNotificiation.alert));
            dispatch(sendDangerNotification('Saving...', `${key} could not be saved`));
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
            dispatch(receiveServerStatus(json));
            startStatusPolling(dispatch, getState);

        }).catch(error => {
            console.log('Error response from server:', error);
        });
};

export const sendSongToSonos = song => {
    return fetch(SONOS_PLAY_URL, {
        method: 'POST',
        headers: Object.assign({'Content-Type': 'application/json'}, DEFAULT_HEADERS),
        body: JSON.stringify(song)
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error sending song to sonos: ' + response.statusText);
            }
        }).then(json => {
            console.log('Sending song to sonos, response from server:', json);
        }).catch(error => {
            console.log('Error response from server:', error);
        });
};


function startStatusPolling(dispatch, getState) {

    const registerHandler = timeout => {
        setTimeout(() => {
            const res = dispatch(requestServerStatus(false));
            res.then(result => {
                if (result && (result === 'isFetching' || result.scanning)) {
                    registerHandler(1000);
                }
            });

        }, timeout); //
    };
    registerHandler(2000);
}