import path from 'path';

export const hasExtension = (filename, ...exts) => {
    const fLower = filename.toLowerCase();
    return !!exts.find(ext => fLower.endsWith(ext));
};


export const hasExtensionOf = (newFilename, ...filenames) => {
    const newExt = path.extname(newFilename.toLowerCase());
    return filenames.find(p => {
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
export const getAlbumDirectories = songArray => {
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
export const getAlbumMainDirectory = albumDirs => {
    // select most used directory
    return Object.keys(albumDirs).reduce((acc, dir) =>
        albumDirs[dir] > acc.max ? {dir, max: albumDirs[dir]} : acc, {max: -Infinity}).dir;
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
export const getCommonParent = albumDirs => {
    const dirs = Object.keys(albumDirs);
    if(dirs.length < 2) {
        return;
    }
    return dirs.reduce((acc, dir) => {
        if(acc === undefined) {
            return path.resolve(dir, '..');
        } else if(acc) {
            return (acc === path.resolve(dir, '..')) ? acc : null;
        }
    }, undefined) || undefined;
};
