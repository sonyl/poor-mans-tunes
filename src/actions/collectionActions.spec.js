/* eslint-env node, jest */
import fetch from 'isomorphic-fetch';
import {createStore as _createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import reducer from '../reducers';
import * as actions from './collectionActions';
import nock from 'nock';
//eslint-disable-next-line


const createStore = (initialState = {}) => {
    return _createStore(
        reducer,
        initialState,
        applyMiddleware(thunk)
    );
};

describe('invalidateCollection', () => {
    let store;
    beforeEach(() => {
        // create a new store instance for each test
        store = createStore();
    });

    it('should invalidate the collection', () => {
        store.dispatch(actions.invalidateCollection());
        expect(store.getState().collection.didInvalidate).toBe(true);
    });
});

describe('getCollection', () => {

    const orgDateNow = Date.now;
    Date.now =  jest.fn(() => 123456);
    afterAll(() => {
        Date.now = orgDateNow;
    });

    let store;
    beforeEach(() => {
        // create a new store instance for each test
        store = createStore();
    });

    afterEach(() => {
        nock.cleanAll();
    });


    it('stores the collection after fetching has finished', () => {
        const testArtists = [{
            artist: 'Artist',
            albums: [{
                album: 'Album', artist: 'Artist', songs:[
                    {title: 'Song', src: 'a url'}
                ]}
            ]
        }];

        nock('http://dummy')
            .get('/files.json')
            .reply(200, testArtists);

        return store.dispatch(actions.getCollection()).then(() => {
            const expectedState = {
                artists: testArtists,
                lastUpdated: 123456,
                error: undefined,
                isFetching: false,
                didInvalidate: false
            };
            expect(store.getState().collection).toEqual(expectedState);
            return null;
        });
    });

    it('does not fetch if current collection is valid', () => {

        store = createStore({collection: { artists: ['some artist'], didInvalidate: false}});

        expect(store.dispatch(actions.getCollection())).toBeUndefined;
    });
});
