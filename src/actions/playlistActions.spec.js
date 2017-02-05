/* eslint-env node, jest */
import * as keys from './actionKeys';
import * as actions from './playlistActions';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const middlewares = [ thunk ];
const mockStore = configureMockStore(middlewares);

describe('playlist actions', () => {

    const initialState = {
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
        // no reducers are running in test, therefore this is the state whenever getState() is called in middleware
        playlist: [],
        settings: {
            playRandom: undefined
        }
    };

    afterEach(() => {
        initialState.settings.playRandom = undefined;
    });


    describe('addSongsToPlaylist', () => {
        it('should create an action to add a song to the playlist', () => {
            const expectedAction = {
                type: keys.ADD_SONG_TO_PLAYLIST,
                artist: 'artist',
                album: 'album',
                songs: ['song'],
                top: false
            };
            expect(actions.addSongsToPlaylist('artist', 'album', 'song')).toEqual(expectedAction);
        });
    });


    describe('removeSongAtIndexFromPlaylist', () => {


        it('should dispatch ADD_SONG_TO_PLAYLIST if \'playRandom\' is true', () => {
            initialState.settings.playRandom = true;
            const expectedActions = [
                {type: keys.REMOVE_SONG_FROM_PLAYLIST, index: 0},
                {
                    type: keys.ADD_SONG_TO_PLAYLIST, album: 'album', artist: 'artist', top: false,
                    songs: [{song: 'title', url: 'mp3'}]
                }
            ];

            const store = mockStore(initialState);
            store.dispatch(actions.removeSongAtIndexFromPlaylist(0));
            expect(store.getActions()).toEqual(expectedActions);
        });

        it('should not dispatch ADD_SONG_TO_PLAYLIST if \'playRandom\' is false', () => {
            initialState.settings.playRandom = false;
            const expectedActions = [
                {type: keys.REMOVE_SONG_FROM_PLAYLIST, index: 0}
            ];

            const store = mockStore(initialState);
            store.dispatch(actions.removeSongAtIndexFromPlaylist(0));
            expect(store.getActions()).toEqual(expectedActions);
        });
    });

    describe('clearPlaylist', () => {
        it('should dispatch ADD_SONG_TO_PLAYLIST if \'playRandom\' is true', () => {
            initialState.settings.playRandom = true;

            const expectedActions = [
                {type: keys.CLEAR_PLAYLIST},
                {
                    type: keys.ADD_SONG_TO_PLAYLIST, album: 'album', artist: 'artist', top: false,
                    songs: [{song: 'title', url: 'mp3'}]
                }
            ];
            const store = mockStore(initialState);
            store.dispatch(actions.clearPlaylist());
            expect(store.getActions()).toEqual(expectedActions);
        });

        it('should not dispatch ADD_SONG_TO_PLAYLIST if \'playRandom\' is false', () => {
            initialState.settings.playRandom = false;

            const expectedActions = [
                {type: keys.CLEAR_PLAYLIST}
            ];
            const store = mockStore(initialState);
            store.dispatch(actions.clearPlaylist());
            expect(store.getActions()).toEqual(expectedActions);
        });
    });

    describe('addRandomSongToPlaylistIfNecessary', () => {
        it('should dispatch ADD_SONG_TO_PLAYLIST', () => {
            initialState.settings.playRandom = true;

            const expectedActions = [
                {
                    type: keys.ADD_SONG_TO_PLAYLIST, album: 'album', artist: 'artist', top: false,
                    songs: [{song: 'title', url: 'mp3'}]
                }
            ];
            const store = mockStore(initialState);
            store.dispatch(actions.addRandomSongToPlaylistIfNecessary());
            expect(store.getActions()).toEqual(expectedActions);
        });
    });

    describe('moveSongToPositionInPlaylist', () => {
        it('should create an action to move a song to a position in the playlist', () => {
            const expectedAction = {
                type: keys.MOVE_SONG_TO_POSITION,
                index: 5,
                newIndex: 7
            };
            expect(actions.moveSongToPositionInPlaylist(5, 7)).toEqual(expectedAction);
        });
    });

});