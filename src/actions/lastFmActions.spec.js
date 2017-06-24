/* @flow */
/* eslint-env node, jest */

import fetch from 'isomorphic-fetch';
import {createStore as _createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import reducer from '../reducers';
import nock from 'nock';
import { requestArtistIfNotExists, requestAlbumIfNotExists} from './lastFmActions';

const createStore: Store = (initialState = {}) => {
    return _createStore(
        reducer,
        initialState,
        applyMiddleware(thunk)
    );
};

describe('lastFm actions', () => {

    let store;

    beforeEach(() => {
        store = createStore({});
    });

    afterEach(() => {
        nock.cleanAll();
    });


    describe('requestArtistIfNotExists', () => {
        it('should update lastFm info if info not already available', () => {

            nock('http://dummy.home/2.0')
                .get(/.*method=artist\.getcorrection.*/)
                .reply(200, {
                    corrections: {correction: {artist: {name: 'Alias'}}}
                })
                .get(/.*method=artist\.getInfo.*/)
                .reply(200, {artist: {name: 'Alias', info: 'Info'}});


            return store.dispatch(requestArtistIfNotExists('The Artist'))
                .then(() => {
                    const fmInfo = store.getState().lastFm['The Artist'].__ARTIST_INFO;

                    expect(fmInfo.isFetching).toBe(false);
                    expect(fmInfo.error).toBeUndefined();
                    expect(fmInfo.info).toEqual({info: 'Info', name: 'Alias'});
                }, (error) => {
                    expect(error).toBeUndefined();
                });
        });

        it('should not update lastFm info if info is already available', () => {
            store = createStore({
                lastFm: {
                    'The Artist': {__ARTIST_INFO: {}}
                }
            });

            return store.dispatch(requestArtistIfNotExists('The Artist'))
                .then(() => {
                    expect(store.getState().lastFm['The Artist'].__ARTIST_INFO).toBeDefined();
                });
        });
    });

    describe('requestAlbumIfNotExists', () => {
        it('should update lastFm info if info not already available', () => {

            const albumInfo = { artist: 'The Artist', album: 'The Album', info: 'album-info'};
            nock('http://dummy.home/2.0')
                .get(/.*method=album\.getinfo.*/)
                .reply(200, {album: albumInfo});


            return store.dispatch(requestAlbumIfNotExists('The Artist', 'The Album'))
                .then(() => {

                    const fmInfo = store.getState().lastFm['The Artist']['The Album'];
                    expect(fmInfo.info).toEqual(albumInfo);
                });
        });

        it('should not update lastFm info if info is already available', () => {
            store = createStore({
                lastFm: {
                    'The Artist': {'The Album': {}}
                }
            });

            return store.dispatch(requestAlbumIfNotExists('The Artist', 'The Album'))
                .then(() => {
                    expect(store.getState().lastFm['The Artist']['The Album']).toBeDefined();
                });
        });
    });

});
