/* @flow */
/* eslint-env node, jest */


import { hasExtension, hasExtensionOf, getAlbumDirectories, getAlbumMainDirectory, getCommonParent } from './fs-scan-utils';

describe('scanner-utils', () => {
    describe('hasExtension() ', () => {
        it('should return true if filename has extension', () => {
            expect(hasExtension('/foo/bar/baz.jpeg', '.jpg', '.jpeg', 'png')).toBe(true);
        });

        it('should return true if filename has extension with different case', () => {
            expect(hasExtension('/foo/bar/baz.JPeg', '.jpg', '.jpeg', 'png')).toBe(true);
        });

        it('should return true if filename has no provided extension', () => {
            expect(hasExtension('/foo/bar/baz.txt', '.jpg', '.jpeg', 'png')).toBe(false);
        });

        it('should return true if no extensions provided', () => {
            expect(hasExtension('/foo/bar/baz.txt')).toBe(false);
        });
    });

    describe('hasExtensionOf() ', () => {
        it('should return false if filename has no extension', () => {
            expect(hasExtensionOf('haha', 'abc.txt')).toBeFalsy();
        });

        it('should return true if array contains filename with same extension is provided as argument', () => {
            expect(hasExtensionOf('haha.txt', 'abc.doc', 'xyz.txt')).toBeTruthy();
        });

        it('should return true if filename with same extension different case is provided as argument', () => {
            expect(hasExtensionOf('haha.tXt', 'abc.doc', 'X.TxT')).toBeTruthy();
        });

        it('should return true if same extension is provided as argument', () => {
            expect(hasExtensionOf('haha.txt', '.doc', '.txt')).toBeTruthy();
        });

        it('should return true if same extension different case is provided as argument', () => {
            expect(hasExtensionOf('haha.tXt', '.doc', '.TxT')).toBeTruthy();
        });
    });

    describe('getAlbumDirectories() ', () => {
        it('should return a object with path and songcount', () => {
            const albumSongs = [
                { title: 'a song', src: '/foo/bar/baz/song.mp3'},
                { title: 'another song', src: ['/foo/bar/baz/song2.mp3', '/foo/vorbis/song2.ogg']}
            ];
            expect(getAlbumDirectories(albumSongs)).toEqual({'/foo/bar/baz': 2, '/foo/vorbis': 1});
        });
        it('should return empty object if no songs given', () => {
            const albumSongs = [
            ];
            expect(getAlbumDirectories(albumSongs)).toEqual({});
        });
    });

    describe('getAlbumMainDirectory() ', () => {
        it('should return the album main parent, if it exists', () => {
            expect(getAlbumMainDirectory({'/foo/bar/baz': 2, '/foo/vorbis': 1})).toBe('/foo/bar/baz');
        });

        it('should return undefined if no songs given', () => {
            expect(getAlbumMainDirectory({})).toBeUndefined();
        });
        it('should return the first directory if no main directory can by determined', () => {
            const albumDirs = {'/foo': 1, '/bar': 1, '/baz': 1};
            expect(getAlbumMainDirectory(albumDirs)).toBe('/foo');
        });
    });

    describe('getCommonParent() ', () => {
        it('should return the common parent, if it exists', () => {
            expect(getCommonParent({'/foo/bar/abc': 1, '/foo/bar/efg': 2, '/foo/bar/fup': 1})).toBe('/foo/bar');
        });

        it('should return falsy, if it doesnot exists', () => {
            expect(getCommonParent({'/foo/bar/abc': 1, '/foo/bar/efg': 2, '/foo/baz': 3})).toBeUndefined();
        });

        it('should return the falsy, if only one path is supplied', () => {
            expect(getCommonParent({'/foo/bar/abc': 1})).toBeUndefined();
        });

        it('should return the falsy, if no path is supplied', () => {
            expect(getCommonParent({})).toBeUndefined();
        });
    });

});
