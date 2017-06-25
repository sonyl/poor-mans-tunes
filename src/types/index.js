/* @flow */
import type { Store as ReduxStore, Dispatch as ReduxDispatch } from 'redux';
import type { RequestCollection, ReceiveCollection, InvalidateCollection } from '../actions/collectionActions';
import type { SendNotification, DismissNotification } from '../actions/notificationsActions';
import type { RequestArtist, ReceiveArtist, RequestAlbum, ReceiveAlbum } from '../actions/lastFmActions';
import type { RequestSongLyrics, ReceiveSongLyrics } from '../actions/lyricsActions';
import type { AddSongsToPlaylist, SetPlaylistEntriesToPlaylist, RemoveSongFromPlaylist, ClearPlaylist } from '../actions/playlistActions';
import type { SelectAlbum, UnselectAlbum, SelectArtist, UnselectArtist } from '../actions/selectionActions';
import type { RequestServerStatus, ReceiveServerStatus, RequestServerSettings, ReceiveServerSettings } from '../actions/serverActions';
import type { PlayRandomSong, PlayRandomAlbum, SetVolume } from '../actions/settingsActions';
import type { Url } from './backend-types';
export type { Artist, Album, Song, Lyrics, ServerStatus, ServerSettings, Url, Collection } from './backend-types';

export type Action =
    | RequestCollection | ReceiveCollection | InvalidateCollection
    | SendNotification | DismissNotification
    | RequestArtist | ReceiveArtist | RequestAlbum | ReceiveAlbum
    | RequestSongLyrics | ReceiveSongLyrics
    | AddSongsToPlaylist | SetPlaylistEntriesToPlaylist | RemoveSongFromPlaylist | ClearPlaylist
    | SelectArtist | UnselectArtist | SelectAlbum | UnselectAlbum
    | RequestServerStatus | ReceiveServerStatus | RequestServerSettings | ReceiveServerSettings
    | PlayRandomSong | PlayRandomAlbum | SetVolume;

//import type { Reducers } from '../reducers';
//type $ExtractFunctionReturn = <V>(v: (...args: any) => V) => V;
//export type State = $ObjMap<Reducers, $ExtractFunctionReturn>;

import type { CollectionState } from '../reducers/collectionReducer';
import type { LastFmState } from '../reducers/lastFmReducer';
import type { LyricsState } from '../reducers/lyricsReducer';
import type { NotificationsState } from '../reducers/notificationsReducer';
import type { PlaylistState } from '../reducers/playlistReducer';
import type { SelectionState } from '../reducers/selectionReducer';
import type { ServerState } from '../reducers/serverReducer';
import type { SettingsState } from '../reducers/settingsReducer';

export type State = {
    +collection: CollectionState,
    +lastFm: LastFmState,
    +lyrics: LyricsState,
    +notifications: NotificationsState,
    +playlist: PlaylistState,
    +selection: SelectionState,
    +server: ServerState,
    +settings: SettingsState,
    +router: Object
};


export type PlaylistEntry = {
    artist: string,
    album: string,
    song: string,
    url: Url
};

// add a Song to playlist
export type PlaylistSong = {
    song: string,
    url: Url
}

export type Selection = {
    index: number,
    name: string
}


export type LastFmInfo = {
    name: string,
    artist: string,
    mbid: string,
    url: string,
    image: {
        '#text': string,
        'size': string
    }[],
    listeners: string,
    playcount: string,
    tracks: any,
    wiki?: {
        published: string,
        summary: string,
        content: string
    }
}
export type LastFmInfoContainer = {
    isFetching: boolean,
    info?: LastFmInfo,
    error?: any,
    receivedAt?: number
}

export type Store = ReduxStore<State, Action>;

export type AlertType = 'info' | 'success' | 'warning' | 'danger';
export type Alert = { id: number, type: AlertType, headline?: string, message: string};

//export type Thunk<A> = ((Dispatch, GetState) => Promise<mixed> | void) => A;
//export type Dispatch = ReduxDispatch<Action> & Thunk<Action>
//export type GetState = () => State;

export type ThunkAction = (dispatch: Dispatch, getState: GetState) => any;
export type PromiseAction = Promise<Action>;
export type Dispatch = (action: Action | ThunkAction | PromiseAction) => any;
export type GetState = () => State;
