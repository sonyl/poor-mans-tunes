/* @flow */
import path from 'path';

export const hasExtension = (filename: string, ...exts: Array<string>): boolean => {
    const fLower = filename.toLowerCase();
    return !!exts.find(ext => fLower.endsWith(ext));
};


export const hasExtensionOf = (newFilename: string, ...filenames: Array<string>): boolean => {
    const newExt = path.extname(newFilename.toLowerCase());
    return !!filenames.find(p => {
        const pLow = p.toLowerCase();
        return newExt === (pLow[0] === '.' ? pLow : path.extname(pLow));
    });
};


/**
 * expects a array with songs
 * @example:
 * [
 *   { title: 'a song',       src: '/foo/bar/baz/song.mp3'},
 *   { title: 'another song', src: ['/foo/bar/baz/song2.mp3', '/foo/vorbis/song2.ogg']}
 * ]
 *
 * @param songArray
 * @returns an object hash with directory names as keys were songs were found, and the song count for each directory as value
 * {
 *      '/foo/bar/baz': 2
 *      '/foo/vorbis': 1
 * }
 */
export const getAlbumDirectories = (songArray: Array<{title: string, src: Array<string> | string}>): {[string]: number} => {
    const albumDirs = songArray.reduce((acc, song) => {
        const {src} = song;
        if (Array.isArray(src)) {
            src.forEach(s => {
                const dir = path.dirname(s);
                acc[dir] = (acc[dir] || 0) + 1;
            });
        } else {
            const dir = path.dirname(src);
            acc[dir] = (acc[dir] || 0) + 1;
        }
        return acc;
    }, {});
    // select most used directory
    return albumDirs;
};


/**
 * expects a albumDirs object, keys represent path names, values the song count for every path;
 * @example:
 * @example:
 * {
 *      '/baz': 1
 *      '/foo/bar': 2
 * }
 *
 * @param albumDirs
 * @returns the most used (main) directory of all songs, '/foo/bar' in the example
 */
export const getAlbumMainDirectory = (albumDirs: {[string]: number}): ?string => {
    // select most used directory
    const keys:Array<string> = Object.keys(albumDirs);
    const reducer = (acc: {max: number, dir: string}, dir: string): {max: number, dir: string} =>
        albumDirs[dir] > acc.max ? {dir, max: albumDirs[dir]} : acc;
    return keys.reduce(reducer, {max: -Infinity, dir: ''}).dir || undefined;
};

/**
 * expects a albumDirs object, keys represent path names, values the song count for every path;
 * @example:
 * {
 *      '/baz': 1
 *      '/foo/bar': 2
 * }
 * @param albumDirs
 * @returns the common parent directory of the different path or undefined if it does not exists
 */
export const getCommonParent = (albumDirs: {[string]: number}): ?string => {
    const dirs = Object.keys(albumDirs);
    if(dirs.length < 2) {
        return;
    }
    return dirs.reduce((acc: ?string, dir: string): ?string => {
        if(acc === undefined) {
            return path.resolve(dir, '..');
        } else if(acc) {
            return (acc === path.resolve(dir, '..')) ? acc : null;
        }
    }, undefined) || undefined;
};
