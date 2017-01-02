import React, {PropTypes} from 'react';

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

const Song = ({id, title, setSong}) => {

    return (
        <div id={id} onClick={onClick}>
            {title}
        </div>
    );

    function onClick(event) {
        const target = event.currentTarget;
        const songId = target.id;
        const songIndex = songId.substring(3);
        setSong(songIndex);
    }
};

const AlbumView = ({artist, album, setSong}) => {

    console.log('LastFmView.render() artist=%o, album=%o', artist, album);
    const albumName = album && album.name || '';
    const artistName = artist && artist.name || '';
    const heading = artistName || albumName ? artistName + ' - ' + albumName : '';

    function renderSongs () {
        if(album && album.album && album.album.songs){
            return album.album.songs.map((s, i) => {
                return <Song id={`so-${i}`}
                             key={i}
                             track={s.track}
                             title={s.title}
                             setSong={setSong}/>;
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
    setSong: PropTypes.func.isRequired,
};

export default AlbumView;

