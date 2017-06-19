/* @flow */

import fs from 'fs';
import path from 'path';
import musicmetadata from 'musicmetadata';
import imgSizeOf from 'image-size';
import promiseLimit from 'promise-limit';
import fsp from './fs-promise';
import { hasExtension, hasExtensionOf, getAlbumDirectories, getAlbumMainDirectory, getCommonParent} from './scanner-utils';

type Picture = {src: string, format: string, width: number, height: number, area: number};
type Image = { img: string, width: number, height: number};
type Song = {src: string, artist: string, album: string, title: string, track: number, year: number,
    tt?: number, disk?: number, td?: number, picture?: Picture };

export type ScanStatistics = {percentDone: number, filesToScan: number, filesScanned: number};

let scanActive = false;
let filesToScan = 0;
let filesScanned = 0;

const fileReadLimit = promiseLimit(10);

export const scanStats = (): ?ScanStatistics => {
    if(scanActive) {
        const percentDone = !filesToScan ? 0 : (100 - Math.round((filesToScan - filesScanned) * 100 / filesToScan));
        return {
            percentDone,
            filesToScan,
            filesScanned
        };
    }
};

export const _scanFile = (path: string, updateState: boolean = true): Promise<any> => {
    const stream = fs.createReadStream(path);
    return new Promise((resolve, reject) => {
        musicmetadata(stream, (err, metadata) => {
            stream.close();
            if(updateState) {
                filesScanned++;
            }
            if(err) {
                reject(err);
            } else {
                resolve(metadata);
            }
        });
    });
};

export const scanFile = (path: string): Promise<any> => _scanFile(path, false);

export const scanTree = (path: string, destFilename: string): Promise<any> => {
    if(scanActive === true) {
        throw new Error('Scan already running');
    }
    scanActive = true;
    filesToScan = filesScanned = 0;
    console.log('scanning: %s', path);
    console.time('finished');
    return walk(path)
        .then(promises => Promise.all(promises))
        .then(reduce)
        .then(sortAndFlatten)
        .then(findEmbeddedImage)
        .then(selectBestImage)
        .then(c => saveCollection(destFilename, c))
        .then(() => {
            scanActive = false;
            console.timeEnd('finished');
        })
        .catch(error => {
            scanActive = false;
            console.timeEnd(error);
            return Promise.reject(error);
        });
};

const file2path = (file: string, root: string): string => file.startsWith(root) ? file.substring(root.length) : file;

const metaToImage = ({type: format, width, height}, file, root): Image => ({
    format,
    width,
    height,
    img: file2path(file, root)
});


const metaToSong = ({artist, albumartist, album, title, track, disk, year, picture}, file, root): ?Song => {
    const songArtist = albumartist[0] || artist[0];
    if(!songArtist || !album) return;
    const song:Song = {
        src: file2path(file, root),
        artist: songArtist,
        album,
        title,
        track: track.no,
        year
    };

    if(track.of) {
        song.tt = track.of;
    }
    if(disk.no) {
        song.disk = disk.no;
    }
    if(disk.of) {
        song.td = disk.of;
    }
    if(picture && picture.length > 0) {
        // 'image-size' lib only supports synchronous read from Buffer
        try{
            const dim = imgSizeOf(picture[0].data);
            if(dim) {
                song.picture = {
                    format: dim.type,
                    width: dim.width,
                    height: dim.height,
                    area: dim.width * dim.height,
                    src:  song.src
                };
            }
        } catch(error) {
            console.log(`Error reading image metadata of: ${songArtist}:${album}:${title} => ${error.message}`);
        }
    }
    return song;
};

const readImgMeta = path => {
    if (typeof path !== 'string') {
        throw new TypeError('invalid argument type');
    }

    return new Promise((resolve, reject) => {
        imgSizeOf(path, (error, dimensions) => {
            filesScanned++;
            if(error) {
                reject(error);
            } else {
                resolve(dimensions);
            }
        });
    });
};

const walk = root => {
    const hasImageExtension = filename => hasExtension(filename, '.jpg', '.png', '.jpeg');
    const isSupportedAudio = filename => hasExtension(filename, '.mp3', '.ogg');

    const walker = dir => fsp.readdir(dir).then(list => {
        return Promise.all(list.map(file => {
            file = path.join(dir, file);
            return fsp.stat(file).then(stat => {
                if (stat.isDirectory()) {
                    return walker(file);
                } else if (isSupportedAudio(file)) {
                    filesToScan++;
                    return fileReadLimit(() => _scanFile(file).then(m => metaToSong(m, file, root)));
                } else if (hasImageExtension(file)) {
                    filesToScan++;
                    return fileReadLimit(() => readImgMeta(file).then(m => metaToImage(m, file, root)).catch(error => {
                        console.log('`Error reading image: %s, %s', file, error.message);
                        return null;
                    }));
                }
            });
        }));
    }).then(results => Array.prototype.concat.apply([], results));     // flatten the array of arrays

    return walker(root);
};


const reduce = songsAndImages => {
    if(!Array.isArray(songsAndImages)) {
        throw new Error('Array expected');
    }

    return songsAndImages.reduce((acc, s) => {
        if(!s) return acc;

        if (s.src) {
            const artist = acc.collection[s.artist] = acc.collection[s.artist] || {artist: s.artist, albums: {}};
            const album = artist.albums[s.album] = artist.albums[s.album] || {album: s.album, artist: s.artist, songs: {}};
            if(album.songs[s.title]) {  // song already exists
                const song = album.songs[s.title];
                let doPush = false;
                if(Array.isArray(song.src)) {
                    if(!hasExtensionOf(s.src, ...song.src)) {
                        doPush = true;
                    }
                } else {
                    if(!hasExtensionOf(s.src, song.src)) {
                        song.src=[song.src];
                        doPush = true;
                    }
                }
                if(doPush) {
                    song.src.push(s.src);   // add source in other audio format
                    if(s.picture && (!song.picture || song.picture.area < s.picture.area)) {
                        song.picture = s.picture;   // replace song embedded picture by higher res version
                    }
                }
            } else {
                delete s.artist;
                delete s.album;
                album.songs[s.title] = s;
            }
        } else {
            const dir = path.dirname(s.img);
            acc.images[dir] = compareImages(acc.images[dir], s);
        }
        return acc;
    }, {images: {}, collection: {}});
};

const compareImages = (oldImg, newImg) => {
    if(oldImg && newImg) {
        if(isCover(oldImg.img)) {
            return oldImg;
        }
        if(isCover(newImg.img)) {
            return newImg;
        }
        const oldArea = oldImg.width && oldImg.height ? oldImg.width * oldImg.height : 0;
        const newArea = newImg.width && newImg.height ? newImg.width * newImg.height : 0;
        return (newArea > oldArea) ? newImg : oldImg;
    }
    return oldImg ? oldImg : newImg;
};

const sortAndFlatten = collectionAndImages => {
    const { collection } = collectionAndImages;
    collectionAndImages.collection = Object.keys(collection).sort().map((artKey => {
        const artist = collection[artKey];
        artist.albums = Object.keys(artist.albums).sort().map(albKey => artist.albums[albKey]);
        artist.albums.forEach(album => {
            album.songs = Object.keys(album.songs).map(title => album.songs[title]);
            album.songs.sort((a, b) => {
                const diskA = a.disk || Number.MAX_VALUE;
                const diskB = b.disk || Number.MAX_VALUE;
                return (diskA === diskB) ? a.track - b.track : diskA - diskB;
            });
            album.songs.forEach(s => {
                if(Array.isArray(s.src)) {
                    const ratedSources = s.src.map(sc => ({
                        src: sc,
                        rate: hasExtension(sc, '.ogg') ? 10 : hasExtension(sc, '.mp3') ? 5 : 0
                    }));
                    ratedSources.sort((a, b) => b.rate - a.rate);
                    s.src = ratedSources.map(u => u.src);
                }
            });
        });
        return artist;
    }));
    return collectionAndImages;
};

const findEmbeddedImage = collectionAndImages => {
    collectionAndImages.collection.forEach(artist => {
        artist.albums.forEach(album => {
            const albumPicture = album.songs.reduce((acc, song) => {
                const { picture } = song;
                if(picture) {
                    delete  song.picture;
                    if(acc && acc.area >= picture.area) {
                        return acc;
                    } else {
                        return picture;
                    }
                }
                return acc;
            }, null);
            if(albumPicture) {
                album.picture = albumPicture;
            }
        });
    });
    return collectionAndImages;
};

const selectBestImage = collectionAndImages => {
    const {collection, images} = collectionAndImages;
    collection.forEach(artist => {
        artist.albums.forEach(album => {
            // select most used directory
            const albumDirs = getAlbumDirectories(album.songs);
            const mainDir = getAlbumMainDirectory(albumDirs);
            // check if image is available
            if(images[mainDir]) {
                // if picture name is cover.xxx set it as album picture
                if(isCover(images[mainDir].img)){
                    album.picture = images[mainDir];
                } else {
                    // replace album picture if it isn't set already
                    if (!album.picture) {
                        console.log('found image for %s-%s: in dir %s: %j', album.artist, album.album, mainDir, images[mainDir]);
                        album.picture = images[mainDir];
                    } else {
                        console.log('found image but not using it for %s-%s: in dir %s: %j',
                            album.artist, album.album, mainDir, images[mainDir]);
                    }
                }
            } else {
                const commonParent = getCommonParent(albumDirs);
                if(commonParent && images[commonParent]) {
                    if(isCover(images[commonParent].img)){
                        album.picture = images[mainDir];
                    } else {
                        // replace album picture if it isn't set already
                        if (!album.picture) {
                            console.log('found image for %s-%s: in common parent dir %s: %j',
                                album.artist, album.album, mainDir, images[commonParent]);
                            album.picture = images[commonParent];
                        }
                    }
                }
            }
            if(album.picture) {
                delete album.picture.width;
                delete album.picture.height;
                delete album.picture.area;
            }
        });
    });
    return collectionAndImages;
};

const isCover = fullPath => path.basename(fullPath).toLowerCase().startsWith('cover.');

const saveCollection = (destFilename, collectionAndImages) => {
    //fs.writeFileSync(destFilename + '.raw', JSON.stringify(collectionAndImages, null, 2));
    return fsp.writeFile(destFilename, JSON.stringify(collectionAndImages.collection, null, 2));
};