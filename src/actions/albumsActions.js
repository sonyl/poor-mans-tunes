import getConfig from '../config.js';

export const REQUEST_ALBUMS = 'REQUEST_ALBUMS';
export const RECEIVE_ALBUMS = 'RECEIVE_ALBUMS';
export const INVALIDATE_ALBUMS = 'INVALIDATE_ALBUMS';

const {baseUrl, collectionUrl } = getConfig({
    baseUrl: 'http://www',
    collectionUrl: '/public/files.json'
});

export const createMp3Url = (part) => {
    return part ? (baseUrl + part) : null;
};

export const requestAlbums = () => ({
    type: REQUEST_ALBUMS
});

export const invalidateAlbums = () => ({
    type: INVALIDATE_ALBUMS
});

export const receiveAlbums = (artists, error) => ({
    type: RECEIVE_ALBUMS,
    artists: artists,
    error: error && (error.message || error),
    receivedAt: Date.now()
});

export const fetchAllAlbums = () => dispatch => {

    dispatch(requestAlbums());

    return fetch(collectionUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error fetching data: ' + response.statusText);
            }
        }).then(json => {
            console.log('parsed json', json);
            dispatch(receiveAlbums(json));
        }).catch(e => {
            console.log('parsing failed', e);
            dispatch(receiveAlbums([], e));
        });
};
