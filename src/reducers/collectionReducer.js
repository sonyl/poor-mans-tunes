import { REQUEST_COLLECTION, RECEIVE_COLLECTION, INVALIDATE_COLLECTION } from '../actions/actionKeys';

// -----------------reducer (default export)
const collection = (
    state = {
        isFetching: false,
        artists: []
    }, action) => {

    switch (action.type) {
        case INVALIDATE_COLLECTION:
            return {
                ...state,
                didInvalidate: true
            };
        case REQUEST_COLLECTION:
            return {
                ...state,
                isFetching: true,
                didInvalidate: false
            };
        case RECEIVE_COLLECTION:
            return {
                ...state,
                isFetching: false,
                lastUpdated: action.receivedAt,
                artists: action.artists,
                error: action.error
            };
    }
    return state;
};

export default collection;

// ------------ selectors

export const getArtists = (state) => {
    return state && state.artists || [];
};

export const getArtist = (state, artistIndex) => {
    if(artistIndex >= 0) {
        const artists = state.artists;
        const artist = artists && artists[artistIndex];
        return artist || null;
    }
    return null;
};

export const getAlbum = (state, artistIndex, albumIndex) => {
    if(artistIndex >= 0 && albumIndex >=0) {
        const artists = state.artists;
        const artist = artists && artists[artistIndex];
        const album = artist && artist.albums[albumIndex];
        return album || null;
    }
    return null;
};

export const getAlbumByName = (state, artist, album) => {
    const artistIndex = (state.artists || []).findIndex(a => a.artist === artist);
    const selArtist = getArtist(state, artistIndex);
    if(selArtist) {
        const albumIndex = (selArtist.albums || []).findIndex(a => a.album === album);
        if(albumIndex >= 0) {
            return selArtist.albums[albumIndex];
        }
    }
    return null;
};

const getRandomAlbum = state => {
    const maxArtists = state.artists && state.artists.length;
    if(maxArtists) {
        const randArtist = state.artists[Math.floor((Math.random() * maxArtists))];
        const maxAlbums = randArtist.albums && randArtist.albums.length;
        if(maxAlbums) {
            const randAlbum = randArtist.albums[Math.floor((Math.random() * maxAlbums))];
            const maxSongs = randAlbum.songs && randAlbum.songs.length;
            if(maxSongs) {
                return {
                    artist: randAlbum.artist,
                    album: randAlbum.album,
                    songs: randAlbum.songs
                };
            }
        }
    }
    return null;
};

export const getRandomAlbumSongs = state => {
    const randAlbum = getRandomAlbum(state);
    if(randAlbum) {
        return {
            artist: randAlbum.artist,
            album: randAlbum.album,
            songs: randAlbum.songs.map(song => ({
                song: song.title,
                url:  song.mp3
            }))
        };
    }
    return null;
};

export const getRandomSong = state => {
    const randAlbum = getRandomAlbum(state);
    if(randAlbum) {
        const randSong = randAlbum.songs[Math.floor((Math.random() * randAlbum.songs.length))];
        if(randSong) {
            return {
                artist: randAlbum.artist,
                album: randAlbum.album,
                songs: [
                    {
                        song: randSong.title,
                        url: randSong.mp3
                    }
                ]
            };
        }
    }
    return null;
};

