import { REQUEST_ALBUMS, RECEIVE_ALBUMS, INVALIDATE_ALBUMS, createMp3Url}  from '../actions/albumsActions';

// -----------------reducer (default export)
const albums = (
    state = {
        isFetching: false,
        didInvalidate: false,
        artists: []
    }, action) => {

    switch (action.type) {
        case INVALIDATE_ALBUMS:
            return {
                ...state,
                didInvalidate: true
            };
        case REQUEST_ALBUMS:
            return {
                ...state,
                isFetching: true,
                didInvalidate: false
            };
        case RECEIVE_ALBUMS:
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

export default albums;

// ------------ selectors
export const getArtist = (state, artistIndex) => {
    if(artistIndex >= 0) {
        const artists = state.artists;
        const artist = artists && artists[artistIndex];
        return artist || {};
    }
    return null;
};

export const getAlbum = (state, artistIndex, albumIndex) => {
    if(artistIndex >= 0 && albumIndex >=0) {
        const artists = state.artists;
        const artist = artists && artists[artistIndex];
        const album = artist && artist.albums[albumIndex];
        return album || {};
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

export const getRandomSong = state => {
    const maxArtists = state.artists && state.artists.length;
    if(maxArtists) {
        const randArtist = state.artists[Math.floor((Math.random() * maxArtists))];
        const maxAlbums = randArtist.albums && randArtist.albums.length;
        if(maxAlbums) {
            const randAlbum = randArtist.albums[Math.floor((Math.random() * maxAlbums))];
            const maxSongs = randAlbum.songs && randAlbum.songs.length;
            if(maxSongs) {
                const randSong = randAlbum.songs[Math.floor((Math.random() * maxSongs))];
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
        }
    }
    return null;
};

