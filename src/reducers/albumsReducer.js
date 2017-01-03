import { REQUEST_ALBUMS, RECEIVE_ALBUMS, INVALIDATE_ALBUMS, createMp3Url}  from '../actions/albumsActions';

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
                didInvalidate: false,
                lastUpdated: action.receivedAt,
                artists: action.artists,
                error: action.error
            };
    }
    return state;
};

export default albums;

export const getSongUrl = (state, {artistIndex, albumIndex, songIndex}) => {
    if(artistIndex >= 0 && albumIndex >=0 && songIndex >=0) {
        const artists = state.artists;
        const artist = artists && artists[artistIndex];
        const album = artist && artist.albums[albumIndex];
        const song = album && album.songs[songIndex];
        if (song) {
            return createMp3Url(song.mp3);
        }
    }
    return null;
};
