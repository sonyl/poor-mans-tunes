import { combineReducers } from 'redux';
import {routerReducer} from 'react-router-redux';

import playlist from './playlistReducer';
import albums, * as fromAlbums from './albumsReducer';
import selectedAlbum from './selectedAlbumReducer';
import selectedArtist from './selectedArtistReducer';


const rootReducer = combineReducers({
    albums,
    selectedArtist,
    selectedAlbum,
    playlist,
    routing: routerReducer
});

export default rootReducer;

export const getSongUrl = (state, ...args) => fromAlbums.getSongUrl(state.albums, ...args);
export const getSongTitle = (state, ...args) => fromAlbums.getSongTitle(state.albums, ...args);