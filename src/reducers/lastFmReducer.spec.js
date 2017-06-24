/* @flow */
/* eslint-env node, jest */

import { getAlbumInfo, getArtistInfo } from './lastFmReducer';

const lastFmInfo = {
    name: 'test',
    artist: 'the artist',
    mbid: '1234',
    url: 'http://example.com',
    image: [],
    listeners: '2',
    playcount: '5',
    tracks: 15
};

describe('lastFmReducer', () => {

    describe('getArtistInfo', () => {

        it('should return undefined if artist not found', () => {
            expect(getArtistInfo({}, 'The Artist')).toBeUndefined();
        });

        it('should return the info object if available', () => {
            expect(getArtistInfo({'The Artist': {__ARTIST_INFO: {info: lastFmInfo, isFetching: false}}},
                'The Artist')).toEqual(lastFmInfo);
        });

    });

    describe('getAlbumInfo', () => {
        it('should return undefined if artist not found', () => {
            expect(getAlbumInfo({}, 'The Artist', 'The Album')).toBeUndefined();
        });

        it('should return the info object if available', () => {
            expect(getAlbumInfo({'The Artist': {'The Album': {info: lastFmInfo, isFetching: false}}},
                'The Artist', 'The Album')).toBe(lastFmInfo);
        });
    });
});