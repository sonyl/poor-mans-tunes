import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import playlist, * as fromPlaylist from './playlistReducer';
import selection, * as fromSelection from './selectionReducer';
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

/* ============ selectors ================= */
export const getArtists = (state, ...args) => fromCollection.getArtists(state.collection, ...args);
export const getAlbumByName = (state, ...args) => fromCollection.getAlbumByName(state.collection, ...args);
export const getRandomSong = (state, ...args) => fromCollection.getRandomSong(state.collection, ...args);
export const getRandomAlbumSongs = (state, ...args) => fromCollection.getRandomAlbumSongs(state.collection, ...args);
export const getArtistInfo = (state, ...args) => fromLastFm.getArtistInfo(state.lastFm, ...args);
export const getAlbumInfo = (state, ...args) => fromLastFm.getAlbumInfo(state.lastFm, ...args);
export const isPlaylistEmpty = (state) => fromPlaylist.isPlaylistEmpty(state.playlist);
export const getValueFromSettings = (state, ...args) => fromSettings.getValue(state.settings, ...args);
export const isSetInSettings = (state, ...args) => fromSettings.isSet(state.settings, ...args);

export const getSelectedArtist = state => fromCollection.getArtist(
    state.collection,
    fromSelection.getArtist(state.selection).index)
    || {};

export const getSelectedAlbum = state => fromCollection.getAlbum(
    state.collection,
    fromSelection.getArtist(state.selection).index,
    fromSelection.getAlbum(state.selection).index)
    || {};

export const getSelectedArtistInfo = state => fromLastFm.getArtistInfo(state.lastFm,
        fromSelection.getArtist(state.selection).name);
export const getSelectedAlbumInfo = state =>  fromLastFm.getAlbumInfo(state.lastFm,
        fromSelection.getArtist(state.selection).name, fromSelection.getAlbum(state.selection).name);
