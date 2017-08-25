/* @flow */
import EventEmitter from 'events';
import fs from 'fs';
import path from 'path';
import musicmetadata from 'musicmetadata';
import imgSizeOf from 'image-size';
import limitPromise from 'promise-limit';
import fsp from '../fs-promise';
import { hasExtension, hasExtensionOf, getAlbumDirectories, getAlbumMainDirectory, getCommonParent} from './fs-scan-utils';

const DEFAULT_PROMISE_LIMIT = 10;
const DEFAULT_SCAN_FILE_DELAY = 0;
const DEFAULT_STATS_UPDATE_DELAY = 500;

type Picture = {src: string, format: string, width: number, height: number, area: number};
type Image = { img: string, width: number, height: number};
type Song = {src: string, artist: string, album: string, title: string, track: number, year: number,
    tt?: number, disk?: number, td?: number, picture?: Picture };

export type ScanStatistics = {percentDone: number, filesToScan: number, filesScanned: number};
export type ScannerOptions = {promiseLimit?: number, scanFileDelay?: number};

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

const readImgMeta = (path: string, scanner: Scanner) => {
    if (typeof path !== 'string') {
        throw new TypeError('invalid argument type');
    }

    return new Promise((resolve, reject) => {
        imgSizeOf(path, (error, dimensions) => {
            scanner.filesScanned++;
            if(error) {
                reject(error);
            } else {
                resolve(dimensions);
            }
        });
    });
};

const walk = (root, scanner: Scanner) => {
    const hasImageExtension = filename => hasExtension(filename, '.jpg', '.png', '.jpeg');
    const isSupportedAudio = filename => hasExtension(filename, '.mp3', '.ogg');

    const walker = dir => fsp.readdir(dir).then(list => {
        return Promise.all(list.map(file => {
            file = path.join(dir, file);
            return fsp.stat(file).then(stat => {
                if (stat.isDirectory()) {
                    return walker(file);
                } else if (isSupportedAudio(file)) {
                    scanner.filesToScan++;
                    return scanner.fileReadLimit(() => Scanner.scanFile(file, scanner).then(m => metaToSong(m, file, root)));
                } else if (hasImageExtension(file)) {
                    scanner.filesToScan++;
                    return scanner.fileReadLimit(() => readImgMeta(file, scanner).then(m => metaToImage(m, file, root)).catch(error => {
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

const emitStatistics = (scanner: Scanner) => {
    if(scanner.scanActive) {
        const percentDone = !scanner.filesToScan ?
            0 : (100 - Math.round((scanner.filesToScan - scanner.filesScanned) * 100 / scanner.filesToScan));
        scanner.emit('status', {
            percentDone,
            filesToScan: scanner.filesToScan,
            filesScanned: scanner.filesScanned
        });
    }
};

class Scanner extends EventEmitter {
    scanActive: boolean;
    filesToScan: number;
    filesScanned: number;
    fileReadLimit: PromiseLimit$Function<Object>;
    statSender: any;
    options: {promiseLimit: number, scanFileDelay: number};

    constructor({promiseLimit = DEFAULT_PROMISE_LIMIT, scanFileDelay = DEFAULT_SCAN_FILE_DELAY}: ScannerOptions = {}) {
        super();
        this.options = {
            promiseLimit,
            scanFileDelay
        };

        this.scanActive = false;
        this.filesToScan = 0;
        this.filesScanned = 0;
        this.fileReadLimit = limitPromise(this.options.promiseLimit);

        console.log('Scanner: %j', this.options);
    }

    static scanFile(path: string, scanner: ?Scanner): Promise<any> {
        const stream = fs.createReadStream(path);
        return new Promise((resolve, reject) => {
            musicmetadata(stream, (err, metadata) => {
                stream.close();
                if(scanner) {
                    scanner.filesScanned++;
                }
                if(err) {
                    reject(err);
                } else {
                    const delay = scanner && scanner.options.scanFileDelay || 0;
                    setTimeout(() => {
                        resolve(metadata);
                    }, delay);
                }
            });
        });
    }

    scanTree(path: string, destFilename: string): Promise<any> {
        if(this.scanActive === true) {
            throw new Error('Scan already running');
        }
        this.scanActive = true;
        this.filesToScan = this.filesScanned = 0;
        console.log('registering stats transmitter');
        this.statSender = setInterval(emitStatistics, DEFAULT_STATS_UPDATE_DELAY, this);
        console.log('scanning: %s', path);
        console.time('scan duration');
        return walk(path, this)
            .then(promises => Promise.all(promises))
            .then(reduce)
            .then(sortAndFlatten)
            .then(findEmbeddedImage)
            .then(selectBestImage)
            .then(c => saveCollection(destFilename, c))
            .then(() => {
                clearInterval(this.statSender);
                this.scanActive = false;
                console.timeEnd('scan duration');
                this.emit('finish', {});
            })
            .catch(error => {
                clearInterval(this.statSender);
                this.scanActive = false;
                console.timeEnd('scan duration');
                this.emit('error', {error});
                return Promise.reject(error);
            });
    }

    scanStats(): ?ScanStatistics {
        if(this.scanActive) {
            const { filesToScan, filesScanned } = this;
            const percentDone = !filesToScan ? 0 : (100 - Math.round((filesToScan - filesScanned) * 100 / filesToScan));
            return {
                percentDone,
                filesToScan,
                filesScanned
            };
        }
    }
}

export default Scanner;

