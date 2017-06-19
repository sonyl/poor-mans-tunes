/* @flow */
import { ADD_SONG_TO_PLAYLIST, REMOVE_SONG_FROM_PLAYLIST, CLEAR_PLAYLIST, MOVE_SONG_TO_POSITION } from '../actions/actionKeys';
import type { PlaylistEntry, Action } from '../types';


export type PlaylistState = PlaylistEntry[];

const playlist = (state: PlaylistState = [], action: Action) => {
    switch (action.type) {
        case ADD_SONG_TO_PLAYLIST: {
            const {artist, album, songs, top} = action;

            if(artist && album && songs && Array.isArray(songs)) {
                const entries = songs.map(s => ({artist, album, song: s.song, url: s.url}));

                if (top) {
                    return [...entries, ...state];
                } else {
                    return [...state, ...entries];
                }
            }
            break;
        }
        case REMOVE_SONG_FROM_PLAYLIST: {
            const {index} = action;
            return [
                ...state.slice(0, index),
                ...state.slice(index + 1)
            ];
        }
        case CLEAR_PLAYLIST: {
            return [];
        }
        case MOVE_SONG_TO_POSITION: {
            const {index, newIndex} = action;
            if(state[index] && state[newIndex] && index < newIndex) {
                return  [
                    ...state.slice(0, index),
                    ...state.slice(index + 1, newIndex + 1),
                    state[index],
                    ...state.slice(newIndex +1)
                ];
            }
            if(state[index] && state[newIndex] && index > newIndex) {
                return  [
                    ...state.slice(0, newIndex),
                    state[index],
                    ...state.slice(newIndex, index),
                    ...state.slice(index + 1)
                ];
            }
        }
    }
    return state;
};

export default playlist;

export const isPlaylistEmpty = (playlist: PlaylistState) => {
    return !playlist || playlist.length == 0;
};

export const getCurrentSong = (playlist: PlaylistState) => {
    return playlist && playlist.length > 0 ? playlist[0] : undefined;
};


