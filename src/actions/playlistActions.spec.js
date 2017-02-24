/* eslint-env node, jest */
import {createStore as _createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import reducer from '../reducers';
import * as actions from './playlistActions';
import { setPlayRandomSong, setPlayRandomAlbum } from './settingsActions';


const createStore = (initialState = {}) => {
    return _createStore(
        reducer,
        initialState,
        applyMiddleware(thunk)
    );
};


describe('playlist actions', () => {
    let store;

    beforeEach(() => {
        store = createStore({
            collection: {
                artists: [{
                    artist: 'Artist',
                    albums: [
                        { album: 'Album', artist: 'Artist', songs: [
                            { title: 'Title', mp3: 'mp3' }
                        ]}
                    ]
                }]
            },
            playlist: [
                { artist: 'Artist1', album: 'Album1', song: 'Song1', url: 'a url 1' },
                { artist: 'Artist2', album: 'Album2', song: 'Song2', url: 'a url 2' },
                { artist: 'Artist3', album: 'Album3', song: 'Song3', url: 'a url 3' },
                { artist: 'Artist4', album: 'Album4', song: 'Song4', url: 'a url 4' },
                { artist: 'Artist5', album: 'Album5', song: 'Song5', url: 'a url 5' }
            ]
        });
    });

    describe('addSongsToPlaylist', () => {
        it('should add a song to the end of the playlist', () => {
            store.dispatch(actions.addSongsToPlaylist('Artist', 'Album', [{song: 'Song', url: 'URL'}]));

            expect(store.getState().playlist.length).toEqual(6);
            expect(store.getState().playlist[5]).toEqual({
                artist: 'Artist',
                album: 'Album',
                song: 'Song',
                url: 'URL'
            });
        });
        it('should add a song to the top of the playlist', () => {
            store.dispatch(actions.addSongsToPlaylist('Artist', 'Album', [{song: 'Song', url: 'URL'}], true));
            expect(store.getState().playlist.length).toEqual(6);
            expect(store.getState().playlist[0]).toEqual({
                artist: 'Artist',
                album: 'Album',
                song: 'Song',
                url: 'URL'
            });
        });
    });


    describe('removeSongAtIndexFromPlaylist', () => {

        it('should not add a roandom song to playlist if it is empty and \'playRandomSong / Album\' is false', () => {
            store.dispatch(actions.removeSongAtIndexFromPlaylist(0));
            store.dispatch(actions.removeSongAtIndexFromPlaylist(0));
            store.dispatch(actions.removeSongAtIndexFromPlaylist(0));
            store.dispatch(actions.removeSongAtIndexFromPlaylist(0));
            store.dispatch(actions.removeSongAtIndexFromPlaylist(0));
            expect(store.getState().playlist.length).toEqual(0);
        });

        it('should add a random song to playlist if it is empty and \'playRandomSong\' is true', () => {
            store.dispatch(setPlayRandomSong(true));
            store.dispatch(actions.removeSongAtIndexFromPlaylist(0));
            store.dispatch(actions.removeSongAtIndexFromPlaylist(0));
            store.dispatch(actions.removeSongAtIndexFromPlaylist(0));
            store.dispatch(actions.removeSongAtIndexFromPlaylist(0));
            store.dispatch(actions.removeSongAtIndexFromPlaylist(0));
            expect(store.getState().playlist[0]).toEqual(
                { album: 'Album', artist: 'Artist', song: 'Title', url: 'mp3'}
            );
        });

        it('should add all random albums songs to playlist if it is empty and \'playRandomAlbum\' is true', () => {
            store.dispatch(setPlayRandomAlbum(true));
            store.dispatch(actions.removeSongAtIndexFromPlaylist(0));
            store.dispatch(actions.removeSongAtIndexFromPlaylist(0));
            store.dispatch(actions.removeSongAtIndexFromPlaylist(0));
            store.dispatch(actions.removeSongAtIndexFromPlaylist(0));
            store.dispatch(actions.removeSongAtIndexFromPlaylist(0));
            expect(store.getState().playlist[0]).toEqual(
                { album: 'Album', artist: 'Artist', song: 'Title', url: 'mp3'}
            );
        });


    });

    describe('clearPlaylist', () => {
        it('should not add a song to playlist if \'playRandomSong / Album\' is false', () => {
            store.dispatch(actions.clearPlaylist());
            expect(store.getState().playlist.length).toEqual(0);
        });

        it('should add a song to playlist if \'playRandomSong\' is true', () => {
            store.dispatch(setPlayRandomSong(true));
            store.dispatch(actions.clearPlaylist());
            expect(store.getState().playlist[0]).toEqual(
                { album: 'Album', artist: 'Artist', song: 'Title', url: 'mp3'}
            );
        });

        it('should add a song to playlist if \'playRandomAlbum\' is true', () => {
            store.dispatch(setPlayRandomAlbum(true));
            store.dispatch(actions.clearPlaylist());
            expect(store.getState().playlist[0]).toEqual(
                { album: 'Album', artist: 'Artist', song: 'Title', url: 'mp3'}
            );
        });
    });

    describe('moveSongToPositionInPlaylist', () => {
        it('should do nothing if at least one index is undefined', () => {
            const oldPlaylist = store.getState().playlist;
            store.dispatch(actions.moveSongToPositionInPlaylist(0, 6));
            expect(store.getState().playlist).toEqual(oldPlaylist);
        });

        it('should do nothing if indexes are equal', () => {
            const oldPlaylist = store.getState().playlist;
            store.dispatch(actions.moveSongToPositionInPlaylist(3, 3));
            expect(store.getState().playlist).toEqual(oldPlaylist);
        });

        it('should be able do move items to higher indexes', () => {
            store.dispatch(actions.moveSongToPositionInPlaylist(1, 3));
            expect(store.getState().playlist).toEqual([
                { artist: 'Artist1', album: 'Album1', song: 'Song1', url: 'a url 1' },
                { artist: 'Artist3', album: 'Album3', song: 'Song3', url: 'a url 3' },
                { artist: 'Artist4', album: 'Album4', song: 'Song4', url: 'a url 4' },
                { artist: 'Artist2', album: 'Album2', song: 'Song2', url: 'a url 2' },
                { artist: 'Artist5', album: 'Album5', song: 'Song5', url: 'a url 5' }
            ]);
        });

        it('should be able do move items to higher indexes, edge case', () => {
            store.dispatch(actions.moveSongToPositionInPlaylist(0, 4));
            expect(store.getState().playlist).toEqual([
                { artist: 'Artist2', album: 'Album2', song: 'Song2', url: 'a url 2' },
                { artist: 'Artist3', album: 'Album3', song: 'Song3', url: 'a url 3' },
                { artist: 'Artist4', album: 'Album4', song: 'Song4', url: 'a url 4' },
                { artist: 'Artist5', album: 'Album5', song: 'Song5', url: 'a url 5' },
                { artist: 'Artist1', album: 'Album1', song: 'Song1', url: 'a url 1' }
            ]);
        });

        it('should be able do move items to lower indexes', () => {
            store.dispatch(actions.moveSongToPositionInPlaylist(3, 1));
            expect(store.getState().playlist).toEqual([
                { artist: 'Artist1', album: 'Album1', song: 'Song1', url: 'a url 1' },
                { artist: 'Artist4', album: 'Album4', song: 'Song4', url: 'a url 4' },
                { artist: 'Artist2', album: 'Album2', song: 'Song2', url: 'a url 2' },
                { artist: 'Artist3', album: 'Album3', song: 'Song3', url: 'a url 3' },
                { artist: 'Artist5', album: 'Album5', song: 'Song5', url: 'a url 5' }
            ]);
        });

        it('should be able do move items to lower indexes, edge case', () => {
            store.dispatch(actions.moveSongToPositionInPlaylist(4, 0));
            expect(store.getState().playlist).toEqual([
                { artist: 'Artist5', album: 'Album5', song: 'Song5', url: 'a url 5' },
                { artist: 'Artist1', album: 'Album1', song: 'Song1', url: 'a url 1' },
                { artist: 'Artist2', album: 'Album2', song: 'Song2', url: 'a url 2' },
                { artist: 'Artist3', album: 'Album3', song: 'Song3', url: 'a url 3' },
                { artist: 'Artist4', album: 'Album4', song: 'Song4', url: 'a url 4' }
            ]);
        });

    });
});