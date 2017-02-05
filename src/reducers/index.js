import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import playlist, * as fromPlaylist from './playlistReducer';
import selection from './selectionReducer';
import settings, * as fromSettings from './settingsReducer';
import lastFm, * as fromLastFm from './lastFmReducer';
import collection, * as fromCollection from './collectionReducer';


const rootReducer = combineReducers({
    collection,
    selection,
    playlist,
    lastFm,
    settings,
    routing: routerReducer
});

export default rootReducer;

export const getArtist = (state, ...args) => fromCollection.getArtist(state.collection, ...args);
export const getAlbum = (state, ...args) => fromCollection.getAlbum(state.collection, ...args);
export const getAlbumByName = (state, ...args) => fromCollection.getAlbumByName(state.collection, ...args);
export const getRandomSong = (state, ...args) => fromCollection.getRandomSong(state.collection, ...args);
export const getArtistInfo = (state, ...args) => fromLastFm.getArtistInfo(state.lastFm, ...args);
export const getAlbumInfo = (state, ...args) => fromLastFm.getAlbumInfo(state.lastFm, ...args);
export const isPlaylistEmpty = (state) => fromPlaylist.isPlaylistEmpty(state.playlist);
export const getValueFromSettings = (state, ...args) => fromSettings.getValue(state.settings, ...args);
export const isSetInSettings = (state, ...args) => fromSettings.isSet(state.settings, ...args);
