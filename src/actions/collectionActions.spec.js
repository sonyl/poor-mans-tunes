/* eslint-env node, jest */
import * as keys from './actionKeys';
import * as actions from './collectionActions';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import fetch from 'isomorphic-fetch';


const middlewares = [ thunk ];
const mockStore = configureMockStore(middlewares);

describe('invalidateCollection', () => {
    it('should create an action to invalidate the collection', () => {
        const expectedAction = {
            type: keys.INVALIDATE_COLLECTION
        };
        expect(actions.invalidateCollection()).toEqual(expectedAction);
    });
});

describe('getCollection', () => {

    const orgDateNow = Date.now;
    Date.now =  jest.fn(() => 123456);
    afterAll(() => {
        Date.now = orgDateNow;
    });

    afterEach(() => {
        nock.cleanAll();
    });


    it('creates RECEIVE_COLLECTION when fetching collection has been done', () => {

        nock('http://dummy')
            .get('/files.json')
            .reply(200, [{artist: 'Artist', albums: [{album: 'Album', artist: 'Artist',
                songs:[{title: 'Song', mp3: 'a url'}]}]}]);

        const expectedActions = [
            { type: keys.REQUEST_COLLECTION },
            { type: keys.RECEIVE_COLLECTION,
                artists: [{
                    artist: 'Artist',
                    albums: [
                        {
                            album: 'Album',
                            artist: 'Artist',
                            songs:[
                                {title: 'Song', mp3: 'a url'}
                            ]
                        }
                    ]
                }],
                receivedAt: 123456,
                error: undefined
            }
        ];

        const store = mockStore({});

        return store.dispatch(actions.getCollection())
            .then(() => {
                expect(store.getActions()).toEqual(expectedActions);
            });

    });
});
