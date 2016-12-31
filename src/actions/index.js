export const REQUEST_ALBUMS = 'REQUEST_ALBUMS';
export const RECEIVE_ALBUMS = 'RECEIVE_ALBUMS';
export const INVALIDATE_ALBUMS = 'INVALIDATE_ALBUMS';

export const  requestAlbums = () => ({
    type: REQUEST_ALBUMS
});

export const receiveAlbums = (artists, error) => ({
    type: RECEIVE_ALBUMS,
    artists:  artists || [],
    error: error && (error.message || error),
    receivedAt: Date.now()
});


export const fetchPosts = () => dispatch => {
    const url = 'public/files.json';

    dispatch(requestAlbums());

    return fetch(url)
        .then(response => {
            if(response.ok) {
                return response.json();
            } else {
                throw new Error('Error fetching data: ' + response.statusText);
            }
        }).then(json => {
            console.log('parsed json', json);
            dispatch(receiveAlbums(json));
        }).catch(e => {
            console.log('parsing failed', e);
            dispatch(receiveAlbums(null, e));
        });
};
