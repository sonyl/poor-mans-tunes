import fs from 'fs';
import path from 'path';
import musicmetadata from 'musicmetadata';
import Promise from 'promise';
import sharp from 'sharp';

function file2url(file, root) {
    return encodeURI(file.startsWith(root) ? file.substring(root.length) : file);
}

function scan(name) {
    const stream = fs.createReadStream(name);
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

function metaToSong({artist, albumartist, album, title, track, disk, year, picture}, file, root) {
    const songArtist = albumartist[0] || artist[0];
    if(!songArtist || !album) return;
    const song = {
        mp3: file2url(file, root),
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
        const img = sharp(picture[0].data);
        return img.metadata().then(function(metadata) {
            song.picture = { format: metadata.format, width: metadata.width, height: metadata.height};
            return song;
        }).catch(error => {
            console.log(`Error reading metadata of: ${songArtist}:${album}:${title}`, error);
            return song;
        });
    }
    return song;
}

function walk (root) {

    var loops = 0;

    function walker(start, callback) {
        loops++;
        fs.stat(start, function (err, stat) {
            if (err) {
                return callback(err);
            }
            if (!stat.isDirectory()) {
                return callback(new Error(`path: ${start} is not a directory`));
            }
            fs.readdir(start, function (err, files) {
                const allFiles = files.reduce(function (acc, i) {
                    var abspath = path.join(start, i);

                    if (fs.statSync(abspath).isDirectory()) {
                        walker(abspath, callback);
                    } else if (i.endsWith('.mp3')) {
                        acc.push(scan(abspath).then(m => metaToSong(m, abspath, root)));
                    }
                    return acc;
                }, []);

                return callback(null, allFiles);
            });
        });
    }

    return new Promise(resolve => {
        var allFiles = [];
        walker(root, (err, files) => {
            if(err) {
                console.log('Error while walking directory tree:', err);
            } else {
                allFiles.push(...files);
            }
            if(--loops === 0) {
                resolve(allFiles);
            }
        });
    });
}

function reduce(songs) {
    if(!Array.isArray(songs)) {
        throw new Error('Array expected');
    }

    return songs.reduce((acc, s) => {
        if (s) {
            const artist = acc[s.artist] = acc[s.artist] || {artist: s.artist, albums: {}};
            const album = artist.albums[s.album] = artist.albums[s.album] || {album: s.album, artist: s.artist, songs: []};
            delete s.artist;
            delete s.album;
            album.songs.push(s);
        }
        return acc;
    }, {});
}

function sortAndFlatten(collection) {
    return Object.keys(collection).sort().map((artKey => {
        const artist = collection[artKey];
        artist.albums = Object.keys(artist.albums).sort().map(albKey => artist.albums[albKey]);
        artist.albums.forEach(album => {
            album.songs.sort((a, b) => a.track - b.track);
        });
        return artist;
    }));
}

function findEmbeddedArtwork(collection) {
    collection.forEach(artist => {
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
                delete albumPicture.area;
                album.picture = albumPicture;
            }
        });
    });
    return collection;
}

function write(collection, destFilename) {
    return new Promise((resolve, reject) => {
        fs.writeFile(destFilename, JSON.stringify(collection, null, 2), error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

export function rescan(path, destFilename) {
    console.log('scanning: %s', path);
    console.time('finished');
    return walk(path)
        .then(Promise.all)
        .then(reduce)
        .then(sortAndFlatten)
        .then(findEmbeddedArtwork)
        .then(c => write(c, destFilename))
        .then(() => {
            console.timeEnd('finished');
        })
        .catch(error => {
            console.log(error);
            return Promise.reject(error);
        });
}


