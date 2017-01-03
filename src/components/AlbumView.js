import React, {PropTypes, Component} from 'react';

import Card from 'grommet/components/Card';
import Markdown from 'grommet/components/Markdown';


function getThumbnail(album) {
    if(album && album.image) {
        if (album.image.length > 3 && album.image[3]['#text'].length > 0) {
            return album.image[3]['#text'];
        }
        if (album.image.length > 2 && album.image[2]['#text'].length > 0) {
            return album.image[2]['#text'];
        }
        if (album.image.length > 1 && album.image[1]['#text'].length > 0) {
            return album.image[1]['#text'];
        }
        if (album.image.length > 0 && album.image[0]['#text'].length > 0) {
            return album.image[0]['#text'];
        }
    }
}

const Song = ({index, title, addToPlaylist}) => {

    return (
        <div onClick={() => addToPlaylist(index)}>
            {title}
        </div>
    );
};

const AlbumView = ({artist, album, addToPlaylist}) => {

    console.log('LastFmView.render() artist=%o, album=%o', artist, album);
    const albumName = album && album.name || '';
    const artistName = artist && artist.name || '';
    const heading = artistName || albumName ? artistName + ' - ' + albumName : '';

    function renderSongs () {
        if(album && album.album && album.album.songs){
            return album.album.songs.map((s, i) => {
                return <Song index={i}
                             key={i}
                             track={s.track}
                             title={s.title}
                             addToPlaylist={addToPlaylist}/>;
            });
        }
    }

    return (
        <Card
            contentPad='small'
            label='Album Info:'
            heading={ heading }
            thumbnail={getThumbnail(album)}
        >
            <Markdown content={album && album.lastFmInfo && album.lastFmInfo.wiki && album.lastFmInfo.wiki.summary}/>
            { renderSongs() }
        </Card>
    );
};


AlbumView.propTypes = {
    album: PropTypes.shape({
        album: PropTypes.shape({
            album: PropTypes.string,
            artist: PropTypes.string
        }),
        lastFmInfo: PropTypes.shape({
            name: PropTypes.string,
            artist: PropTypes.string,
            wiki: PropTypes.object
        })
    }),
    artist: PropTypes.shape({
    }),
    addToPlaylist: PropTypes.func.isRequired
};

export default AlbumView;

