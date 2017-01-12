import React, {PropTypes, Component} from 'react';
import GlyphIcon from './GlyphIcon';
import SplitButton from './SplitButton';

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
    return <GlyphIcon iconName='share-alt'/>;
}

function Song({index, title, addToPlaylist}){
    return (
        <div>
            <SplitButton
                size="extra-small"
                defaultLabel=""
                defaultIcon={<PlusIcon/>}
                defaultOnClick={() => addToPlaylist(index)}
                actions={ [
                    { label: 'add songs to end of playlist', onClick: () => addToPlaylist(index, false)},
                    { label: 'add song to top of playlist', onClick: () => addToPlaylist(index, true)}
                ] }
            />
            &nbsp;&nbsp; {title}
        </div>
    );
}

const AlbumView = ({album, addToPlaylist}) => {

    console.log('AlbumView.render() album=%o', album);
    const albumName = album && album.name;

    function allIndexes() {
        return album && album.album && album.album.songs ? album.album.songs.map((s, i) => i) : [];
    }

    function onClick() {
        console.log('AlbumView.SplitButton.onClick(): ', arguments);
    }

    function renderSongs () {
        if(album && album.album && album.album.songs) {

            const splitButtonProps = {
                actions: [
                    {label: 'add all songs to end of playlist', onClick: () => addToPlaylist(allIndexes(), false)},
                    {label: 'add all songs to top of playlist', onClick: () => addToPlaylist(allIndexes(), true)}
                ],
                defaultLabel: 'Add album to playlist',
                defaultIcon: <PlusIcon/>,
                defaultOnClick: () => addToPlaylist(allIndexes(), false)
            };

            return (
                <div>
                    <h4>Songs:
                        <span className="pull-right">
                            <SplitButton {...splitButtonProps}/>
                        </span>
                    </h4>

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

