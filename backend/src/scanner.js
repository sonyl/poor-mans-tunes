import fs from 'fs';
import path from 'path';
import musicmetadata from 'musicmetadata';
import imgSizeOf from 'image-size';
import promiseLimit from 'promise-limit';

// promisify the fs functions used
const readdirAsync = dir => {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, list) => { if(err) reject(err); else resolve(list);});
    });
};

const statAsync = file => {
    return new Promise((resolve, reject) => {
        fs.stat(file, (err, stat) => { if (err) reject(err);  else resolve(stat);});
    });
};

const fileReadLimit = promiseLimit(10);

function logQueueDepth() {
    if(fileReadLimit.queue > 0 && fileReadLimit.queue % 100 === 0) {
        console.log('\rRemaining:', fileReadLimit.queue);
    }
}

export function scanFile(path) {
    logQueueDepth();
    const stream = fs.createReadStream(path);
    return new Promise((resolve, reject) => {
        musicmetadata(stream, (err, metadata) => {
            stream.close();
            if(err) {
                reject(err);
            } else {
                resolve(metadata);
            }
        });
    });
}

export function scanTree(path, destFilename) {
    console.log('scanning: %s', path);
    console.time('finished');
    return walk(path)
        .then(promises => Promise.all(promises))
        .then(reduce)
        .then(sortAndFlatten)
        .then(findEmbeddedImage)
        .then(selectBestImage)
        .then(c => write(c, destFilename))
        .then(() => {
            console.timeEnd('finished');
        })
        .catch(error => {
            console.log(error);
            return Promise.reject(error);
        });
}

function file2path(file, root) {
    return file.startsWith(root) ? file.substring(root.length) : file;
}


function metaToSong({artist, albumartist, album, title, track, disk, year, picture}, file, root) {
    const songArtist = albumartist[0] || artist[0];
    if(!songArtist || !album) return;
    const song = {
        mp3: file2path(file, root),
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
                song.picture = { format: dim.type, width: dim.width, height: dim.height };
            }
        } catch(error) {
            console.log(`Error reading image metadata of: ${songArtist}:${album}:${title} => ${error.message}`);
        }
    }
    return song;
}

function readImgMeta(path) {
    logQueueDepth();
    if (typeof path !== 'string') {
        throw new TypeError('invalid argument type');
    }

    return new Promise((resolve, reject) => {
        imgSizeOf(path, (error, dimensions) => {
            if(error) {
                reject(error);
            } else {
                resolve(dimensions);
            }
        });
    });
}

function metaToImage({type: format, width, height}, file, root) {
    return {
        format,
        width,
        height,
        img: file2path(file, root)
    };
}


function walk(root) {
    function hasImageExtension(filename) {
        const f = filename.toLowerCase();
        let found = false;
        ['.jpg', '.png', '.jpeg'].forEach(ext => {
            if (filename.endsWith(ext)) {
                found = true;
            }
        });
        return found;
    }

    function walker(dir) {
        return readdirAsync(dir).then(list => {
            return Promise.all(list.map(file => {
                file = path.join(dir, file);
                return statAsync(file).then(stat => {
                    if (stat.isDirectory()) {
                        return walker(file);
                    } else if (file.endsWith('.mp3')) {
                        return fileReadLimit(() => scanFile(file).then(m => metaToSong(m, file, root)));
                    } else if (hasImageExtension(file)) {
                        return fileReadLimit(() => readImgMeta(file).then(m => metaToImage(m, file, root)).catch(error => {
                            console.log('`Error reading image: %s, %s', file, error.message);
                            return null;
                        }));
                    }
                });
            }));
        }).then(function (results) {
            // flatten the array of arrays
            return Array.prototype.concat.apply([], results);
        });
    }

    return walker(root);
}


function reduce(songsAndImages) {
    if(!Array.isArray(songsAndImages)) {
        throw new Error('Array expected');
    }

    return songsAndImages.reduce((acc, s) => {
        if(!s) return acc;

        if (s.mp3) {
            const artist = acc.collection[s.artist] = acc.collection[s.artist] || {artist: s.artist, albums: {}};
            const album = artist.albums[s.album] = artist.albums[s.album] || {album: s.album, artist: s.artist, songs: []};
            delete s.artist;
            delete s.album;
            album.songs.push(s);
        } else {
            const dir = path.dirname(s.img);
            acc.images[dir] = compareImages(acc.images[dir], s);
        }
        return acc;
    }, {images: {}, collection: {}});
}

function compareImages(oldImg, newImg) {
    console.log('comparing: %j <=> %j', oldImg, newImg);
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
}

function sortAndFlatten(db) {
    const {images, collection} = db;
    db.collection = Object.keys(collection).sort().map((artKey => {
        const artist = collection[artKey];
        artist.albums = Object.keys(artist.albums).sort().map(albKey => artist.albums[albKey]);
        artist.albums.forEach(album => {
            album.songs.sort((a, b) => a.track - b.track);
        });
        return artist;
    }));
    return db;
}

function findEmbeddedImage(db) {
    db.collection.forEach(artist => {
        artist.albums.forEach(album => {
            const albumPicture = album.songs.reduce((acc, song) => {
                const { picture } = song;
                if(picture) {
                    delete  song.picture;
                    const area = picture.height * picture.width;
                    if(acc && acc.area >= area) {
                        return acc;
                    } else {
                        picture.area = area;
                        picture.mp3 = song.mp3;
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
    return db;
}

function selectBestImage(db) {
    db.collection.forEach(artist => {
        artist.albums.forEach(album => {
            // count all directories for album songs
            const songDirs = album.songs.reduce((acc, song) => {
                const {mp3} = song;
                if (mp3) {
                    const dir = path.dirname(mp3);
                    acc[dir] = (acc[dir] || 0) + 1;
                }
                return acc;
            }, {});
            // select most used directory
            const mainDir = Object.keys(songDirs).reduce((acc, dir) =>
                songDirs[dir] > acc.max ? {dir, max: songDirs[dir]} : acc, {max: -Infinity}).dir;
            // check if image is available
            if(db.images[mainDir]) {
                // if picture name is cover.xxx set it as album picture
                if(isCover(db.images[mainDir].img)){
                    album.picture = db.images[mainDir];
                } else {
                    // replace album picture if it isn't set already
                    if (!album.picture) {
                        console.log('found image for %s-%s: in dir %s: %j', album.artist, album.album, mainDir, db.images[mainDir]);
                        album.picture = db.images[mainDir];
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
    return db;
}

function isCover(fullPath) {
    return path.basename(fullPath).toLowerCase().startsWith('cover.');
}

function write(db, destFilename) {
    //fs.writeFileSync(destFilename + '.raw', JSON.stringify(db, null, 2));

    return new Promise((resolve, reject) => {
        fs.writeFile(destFilename, JSON.stringify(db.collection, null, 2), error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}


