import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import playlist from './playlistReducer';
import selection from './selectionReducer';
import lastFm, * as fromLastFm from './lastFmReducer';
import albums, * as fromAlbums from './albumsReducer';


const rootReducer = combineReducers({
    albums,
    selection,
    playlist,
    lastFm,
    routing: routerReducer
});

export default rootReducer;

export const getArtist = (state, ...args) => fromAlbums.getArtist(state.albums, ...args);
export const getAlbum = (state, ...args) => fromAlbums.getAlbum(state.albums, ...args);
export const getAlbumByName = (state, ...args) => fromAlbums.getAlbumByName(state.albums, ...args);
export const getRandomSong = (state, ...args) => fromAlbums.getRandomSong(state.albums, ...args);
export const getArtistInfo = (state, ...args) => fromLastFm.getArtistInfo(state.lastFm, ...args);
export const getAlbumInfo = (state, ...args) => fromLastFm.getAlbumInfo(state.lastFm, ...args);
