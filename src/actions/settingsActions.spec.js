/* eslint-env node, jest */

import {createStore as _createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import reducer from '../reducers';
import * as actions from './settingsActions';
import { getValueFromSettings, isSetInSettings} from '../reducers';

const createStore = (initialState = {}) => {
    return _createStore(
        reducer,
        initialState,
        applyMiddleware(thunk)
    );
};


describe('playlistActions', () => {

    let store;
    beforeEach(() => {
        // create a new store instance for each test
        store = createStore();
    });

    describe('setVolume', () => {

        it('should set the volume in the store', () => {
            store.dispatch(actions.setVolume(0.5));
            expect(getValueFromSettings(store.getState(), 'volume')).toEqual(0.5);
        });

        it('should reset the volume in the store', () => {
            store.dispatch(actions.setVolume(0));
            expect(getValueFromSettings(store.getState(), 'volume')).toEqual(0.0);
        });
    });

    describe('setPlayRandomSong', () => {

        it('should set the playRandomSong-Flag in the store', () => {
            store.dispatch(actions.setPlayRandomSong(true));
            expect(isSetInSettings(store.getState(), 'playRandomSong')).toEqual(true);
        });

        it('should reset the playRandomSong-Flag in the store', () => {
            store.dispatch(actions.setPlayRandomSong(false));
            expect(isSetInSettings(store.getState(), 'playRandomSong')).toEqual(false);
        });

        it('should add a song to playlist, if playlist is empty', () => {
            store = createStore({
                collection: {
                    artists: [{
                        artist: 'artist',
                        albums: [
                            {
                                album: 'album',
                                artist: 'artist',
                                songs: [
                                    {
                                        title: 'title',
                                        mp3: 'mp3'
                                    }
                                ]
                            }
                        ]
                    }]
                }
            });
            expect(store.getState().playlist.length).toEqual(0);
            store.dispatch(actions.setPlayRandomSong(true));
            expect(isSetInSettings(store.getState(), 'playRandomSong')).toEqual(true);
            expect(store.getState().playlist.length).toEqual(1);
        });

        it('should not add a song to playlist, if playlist is not empty', () => {
            store = createStore({
                collection: {
                    artists: [{
                        artist: 'artist',
                        albums: [
                            {
                                album: 'album',
                                artist: 'artist',
                                songs: [
                                    {
                                        title: 'title',
                                        mp3: 'mp3'
                                    }
                                ]
                            }
                        ]
                    }]
                },
                playlist: [{}]
            });
            expect(store.getState().playlist.length).toEqual(1);
            store.dispatch(actions.setPlayRandomSong(true));
            expect(isSetInSettings(store.getState(), 'playRandomSong')).toEqual(true);
            expect(store.getState().playlist.length).toEqual(1);
        });
    });
});