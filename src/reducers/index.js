/* @flow */
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import playlist, * as fromPlaylist from './playlistReducer';
import selection, * as fromSelection from './selectionReducer';
import settings, * as fromSettings from './settingsReducer';
import lastFm, * as fromLastFm from './lastFmReducer';
import collection, * as fromCollection from './collectionReducer';
import server, * as fromServer from './serverReducer';
import lyrics, * as fromLyrics from './lyricsReducer';
import notifications from './notificationsReducer';

import type { State } from '../types';

const reducers = combineReducers({
    collection,
    selection,
    playlist,
    lastFm,
    settings,
    server,
    notifications,
    lyrics,
    router: routerReducer
});

export type Reducers = typeof reducers;

export default reducers;
const NO_SELECTION = {};

/* ============ selectors ================= */
export const getArtists = (state: State, ...args: any) => fromCollection.getArtists(state.collection, ...args);
export const getLastCollectionUpdate = (state: State) => fromCollection.getLastUpdate(state.collection);
export const getAlbumByName = (state: State, ...args: any) => fromCollection.getAlbumByName(state.collection, ...args);
export const getRandomSong = (state: State, ...args: any) => fromCollection.getRandomSong(state.collection, ...args);
export const getRandomAlbumSongs = (state: State, ...args: any) => fromCollection.getRandomAlbumSongs(state.collection, ...args);
export const findSongByUrl = (state: State, url?: ?string) => fromCollection.findSongByUrl(state.collection, url);
export const getArtistInfo = (state: State, ...args: any) => fromLastFm.getArtistInfo(state.lastFm, ...args);
export const getAlbumInfo = (state: State, ...args: any) => fromLastFm.getAlbumInfo(state.lastFm, ...args);
export const isPlaylistEmpty = (state: State) => fromPlaylist.isPlaylistEmpty(state.playlist);
export const getCurrentSong = (state: State) =>  fromPlaylist.getCurrentSong(state.playlist);
export const getValueFromSettings = (state: State, ...args: any) => fromSettings.getValue(state.settings, ...args);
export const isSetInSettings = (state: State, ...args: any) => fromSettings.isSet(state.settings, ...args);
export const getServerStatus = (state: State) => fromServer.getStatus(state.server);
export const getServerSettings = (state: State) => fromServer.getSettings(state.server);
export const getLyrics = (state: State) => fromLyrics.getLyrics(state.lyrics, getCurrentSong(state));

export const getSelectedArtist = (state: State) => fromCollection.getArtist(
    state.collection,
    fromSelection.getArtist(state.selection).index)
    || NO_SELECTION;

export const getSelectedAlbum = (state: State) => fromCollection.getAlbum(
    state.collection,
    fromSelection.getArtist(state.selection).index,
    fromSelection.getAlbum(state.selection).index)
    || NO_SELECTION;

export const getSelectedArtistInfo = (state: State) => fromLastFm.getArtistInfo(state.lastFm,
    fromSelection.getArtist(state.selection).name);
export const getSelectedAlbumInfo = (state: State) =>  fromLastFm.getAlbumInfo(state.lastFm,
    fromSelection.getArtist(state.selection).name, fromSelection.getAlbum(state.selection).name);
