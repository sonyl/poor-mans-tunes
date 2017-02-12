/* eslint-env node, jest */

import {createStore as _createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import reducer from '../reducers';
import * as actions from './selectionActions';
import nock from 'nock';
//eslint-disable-next-line
import fetch from 'isomorphic-fetch';


const createStore = (initialState = {}) => {
    return _createStore(
        reducer,
        initialState,
        applyMiddleware(thunk)
    );
};


describe('selectionActions', () => {

    const initialState = { selection: {
        album: {index: 42, name: 'the Album'},
        artist: {index: 23, name: 'the Artist'}
    }};


    let store;
    beforeEach(() => {
        // create a new store instance for each test
        store = createStore(initialState);
    });

    afterEach(() => {
        nock.cleanAll();
    });

    describe('unselectArtist', () => {

        it('should unselect the seleted artist and album', () => {
            store.dispatch(actions.unselectArtist());
            expect(store.getState().selection.artist).toEqual({});
            expect(store.getState().selection.album).toEqual({});
        });
    });

    describe('unselectAlbum', () => {

        it('should unselect the seleted album, but not artist', () => {
            store.dispatch(actions.unselectAlbum());
            expect(store.getState().selection.artist).toEqual(initialState.selection.artist);
            expect(store.getState().selection.album).toEqual({});
        });
    });


    describe('selectArtist', () => {

        it('should reject if a argument is missing', () => {
            return store.dispatch(actions.selectArtist(33))
                .then((data) => {
                    expect('expected a rejection').toBeUndefined();
                }).catch(error => {
                    expect(error.toString()).toMatch(/missing/);
                });
        });

        it('should have set the selection and have lastFm info updated', () => {
            nock('http://dummy.home/2.0')
                .get(/.*method=artist\.getcorrection.*/)
                .reply(200, {
                    corrections: { correction: { artist: { name: 'Alias'}}}
                })
                .get(/.*method=artist\.getInfo.*/)
                .reply(200, {artist: {name: 'Alias', info: 'Info'}});

            return store.dispatch(actions.selectArtist(33, 'The other Artist'))
            .then(() => {

                expect(store.getState().selection.artist).toEqual({index: 33, name: 'The other Artist'});

                const fmInfo = store.getState().lastFm['The other Artist'].__ARTIST_INFO;

                expect(fmInfo.isFetching).toBe(false);
                expect(fmInfo.error).toBeUndefined();
                expect(fmInfo.info).toEqual({info: 'Info', name: 'Alias'});
            }, (error) => {
                expect(error).toBeUndefined();
            });
        });
    });

    describe('selectAlbum', () => {

        it('should reject if a argument is missing', () => {
            return store.dispatch(actions.selectAlbum(33, {album: 'The Album'}))
                .then((data) => {
                    expect('expected a rejection').toBeUndefined();
                }).catch(error => {
                    expect(error.toString()).toMatch(/missing/);
                });
        });


        it('should have set the selection and have lastFm info updated', () => {
            const albumInfo = { artist: 'The other Artist', album: 'The other Album', info: 'album-info'};
            nock('http://dummy.home/2.0')
                .get(/.*method=album\.getinfo.*/)
                .reply(200, {album: albumInfo});

            return store.dispatch(actions.selectAlbum(66, {artist: 'The other Artist', album: 'The other Album'}))
                .then(() => {

                    expect(store.getState().selection.album).toEqual({index: 66, name: 'The other Album'});

                    const fmInfo = store.getState().lastFm['The other Artist']['The other Album'];
                    expect(fmInfo.info).toEqual(albumInfo);
                    expect(fmInfo.isFetching).toBe(false);
                    expect(fmInfo.error).toBeUndefined();

                }, (error) => {
                    expect(error).toBeUndefined();
                });
        });
    });

});