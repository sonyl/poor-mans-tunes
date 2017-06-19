/* @flow */
import { SELECT_ARTIST, UNSELECT_ARTIST, SELECT_ALBUM, UNSELECT_ALBUM } from './actionKeys';
import { requestArtistIfNotExists, requestAlbumIfNotExists} from './lastFmActions';

import type { Dispatch, Album } from '../types';

export type SelectArtist = {
    type: 'SELECT_ARTIST',
    index: number,
    name: string
}

export type UnselectArtist = {
    type: 'UNSELECT_ARTIST',
}

export type SelectAlbum = {
    type: 'SELECT_ALBUM',
    index: number,
    name: string
}

export type UnselectAlbum = {
    type: 'UNSELECT_ALBUM',
}

/* ============ artist actions =================*/


export const unselectArtist = () => ({
    type: UNSELECT_ARTIST
});


export const selectArtist = (index: number, name: string) => (dispatch: Dispatch) => {
    dispatch(({
        type: SELECT_ARTIST,
        index,
        name
    }: SelectArtist));
    return dispatch(requestArtistIfNotExists(name));
};

/* ============ album actions =================*/
export const unselectAlbum = () => ({
    type: UNSELECT_ALBUM
});


export const selectAlbum = (index: number, album: Album) => (dispatch: Dispatch) => {
    dispatch(({
        type: SELECT_ALBUM,
        index,
        name: album.album
    }: SelectAlbum));
    return dispatch(requestAlbumIfNotExists(album.artist, album.album));
};


