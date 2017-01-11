import React, {PropTypes, Component} from 'react';
import GlyphIcon from './GlyphIcon';
import { sanitizeHtml } from './utils';


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

function PlusIcon() {
    return <GlyphIcon iconName='plus'/>;
}

function Song({index, title, addToPlaylist}){
    return (
        <div onClick={() => addToPlaylist(index)}>
            {title} &nbsp; <PlusIcon/>
        </div>
    );
}

const AlbumView = ({album, addToPlaylist}) => {

    console.log('AlbumView.render() album=%o', album);
    const albumName = album && album.name;

    function allIndexs() {
        return album && album.album && album.album.songs ? album.album.songs.map((s, i) => i) : [];
    }

    function renderSongs () {
        if(album && album.album && album.album.songs) {

            return (
                <div>
                    <h4>Songs:<span className="pull-right">{renderAnchor()}</span></h4>
                    {
                        album.album.songs.map((s, i) => (
                            <Song index={i}
                                  key={i}
                                  track={s.track}
                                  title={s.title}
                                  addToPlaylist={addToPlaylist}/>
                        ))
                    }
                </div>
            );
        }
    }

    const renderAnchor = () => {
        if(albumName) {
            return <button type="button"
                           className="btn btn-default"
                           onClick={() => addToPlaylist(allIndexs())}
                   >Add album to playlist</button>;
        }
    };

    const renderThumbnail = () => {
        const url = getThumbnail(album.lastFmInfo);
        if(url) {
            return (
                <div className="thumbnail">
                    <img src={url}/>
                </div>
            );
        }
    };

    const renderWiki = () => {
        if(album && album.lastFmInfo && album.lastFmInfo.wiki && album.lastFmInfo.wiki.summary) {
            return  <div dangerouslySetInnerHTML={sanitizeHtml(album.lastFmInfo.wiki.summary)}/>;
        }
    };

    return (
        <div className="panel panel-default">
            <div className="panel-heading">
                <h3>Album: { albumName }</h3>
                {renderThumbnail()}
            </div>
            <div className="panel-body">
                { renderWiki() }
                { renderSongs() }
            </div>
        </div>
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
    addToPlaylist: PropTypes.func.isRequired
};

export default AlbumView;

