/* @flow */
import getConfig from '../config.js';
import { REQUEST_COLLECTION, RECEIVE_COLLECTION, INVALIDATE_COLLECTION } from './actionKeys';
import type { Dispatch, GetState, Collection } from '../types';

export type RequestCollection = { type: 'REQUEST_COLLECTION' };
export type ReceiveCollection = { type: 'RECEIVE_COLLECTION', artists: Collection, receivedAt: number, error: any };
export type InvalidateCollection =  { type: 'INVALIDATE_COLLECTION'};

const { collectionUrl } = getConfig({
    collectionUrl: 'http://localhost:9001/api/collection'
});
const headers = new Headers({
    accept: 'application/json'
});

const requestCollection = (): RequestCollection => ({
    type: REQUEST_COLLECTION
});

const receiveCollection = (artists, error): ReceiveCollection => ({
    type: RECEIVE_COLLECTION,
    artists,
    error: error && (error.message || error),
    receivedAt: Date.now()
});

const shouldFetchCollection = state => {
    const collection = state.collection;
    return !collection || collection.didInvalidate != false;
};

export const getCollection = () => (dispatch: Dispatch, getState: GetState): Promise<mixed> => {
    if(shouldFetchCollection(getState())) {

        dispatch(requestCollection());

        return fetch(collectionUrl, {headers})
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
    }
    return Promise.resolve();
};

export const invalidateCollection = (): InvalidateCollection => ({
    type: INVALIDATE_COLLECTION
});
