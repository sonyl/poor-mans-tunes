import getConfig from '../config.js';
import { REQUEST_COLLECTION, RECEIVE_COLLECTION, INVALIDATE_COLLECTION } from './actionKeys';
const { collectionUrl } = getConfig({
    collectionUrl: '/public/files.json'
});

const requestCollection = () => ({
    type: REQUEST_COLLECTION
});

const receiveCollection = (artists, error) => ({
    type: RECEIVE_COLLECTION,
    artists,
    error: error && (error.message || error),
    receivedAt: Date.now()
});

export const getCollection = () => dispatch => {

    dispatch(requestCollection());

    return fetch(collectionUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error fetching data: ' + response.statusText);
            }
        }).then(json => {
            dispatch(receiveCollection(json));
        }).catch(e => {
            dispatch(receiveCollection([], e));
        });
};

export const invalidateCollection = () => ({
    type: INVALIDATE_COLLECTION
});
