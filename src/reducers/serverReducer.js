import { REQUEST_SERVER_STATUS, RECEIVE_SERVER_STATUS, REQUEST_SERVER_SETTINGS, RECEIVE_SERVER_SETTINGS } from '../actions/actionKeys';


const server = (state = {status: {isFetching: false}, settings: {isFetching: false}}, action) => {
    switch (action.type) {
        case REQUEST_SERVER_STATUS:
            return {
                ...state,
                status: {
                    ...state.status,
                    isFetching: true
                }
            };
        case RECEIVE_SERVER_STATUS:
            return {
                ...state,
                status: {
                    isFetching: false,
                    lastUpdated: action.receivedAt,
                    status: action.status,
                    error: action.error
                }
            };
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

export const getStatus = ({status, error, lastUpdated}) => ({
    status,
    error,
    lastUpdated
});

export const getSettings = ({settings, error, lastUpdated}) => {
    const s = {
        settings,
        error,
        lastUpdated
    };
    return s;
};


