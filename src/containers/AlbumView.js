import React, {PropTypes, Component} from 'react';
import { connect } from 'react-redux';
import { addToPlaylist } from '../actions/playlistActions';
import GlyphIcon from '../components/GlyphIcon';
import SplitButton from '../components/SplitButton';
import { sanitizeHtml } from '../components/utils';


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

const AlbumView = ({artists, selectedAlbum, selectedArtist, addToPlaylist}) => {

    console.log('AlbumView.render() album=%o', selectedAlbum);
    const albumName = selectedAlbum && selectedAlbum.name;

    function allIndexes() {
        return selectedAlbum && selectedAlbum.album && selectedAlbum.album.songs
            ? selectedAlbum.album.songs.map((s, i) => i)
            : [];
    }

    function onClick() {
        console.log('AlbumView.SplitButton.onClick(): ', arguments);
    }

    function renderSongs () {
        if(selectedAlbum && selectedAlbum.album && selectedAlbum.album.songs) {

            const splitButtonProps = {
                actions: [
                    {label: 'add all songs to end of playlist', onClick: () => addEntryToPlaylist(allIndexes(), false)},
                    {label: 'add all songs to top of playlist', onClick: () => addEntryToPlaylist(allIndexes(), true)}
                ],
                defaultLabel: 'Add album to playlist',
                defaultIcon: <PlusIcon/>,
                defaultOnClick: () => addEntryToPlaylist(allIndexes(), false)
            };

            return (
                <div>
                    <h4>Songs:
                        <span className="pull-right">
                            <SplitButton {...splitButtonProps}/>
                        </span>
                    </h4>

                    {
                        selectedAlbum.album.songs.map((s, i) => (
                            <Song index={i}
                                  key={i}
                                  track={s.track}
                                  title={s.title}
                                  addToPlaylist={addEntryToPlaylist}/>
                        ))
                    }
                </div>
            );
        }
    }

    const renderThumbnail = () => {
        const url = getThumbnail(selectedAlbum.lastFmInfo);
        if(url) {
            return (
                <div className="thumbnail">
                    <img src={url}/>
                </div>
            );
        }
    };

    const renderWiki = () => {
        if(selectedAlbum && selectedAlbum.lastFmInfo && selectedAlbum.lastFmInfo.wiki && selectedAlbum.lastFmInfo.wiki.summary) {
            return  <div dangerouslySetInnerHTML={sanitizeHtml(selectedAlbum.lastFmInfo.wiki.summary)}/>;
        }
    };

    const addEntryToPlaylist = (index, top=false) => {
        console.log('AlbumView.addEntryToPlaylist()', index, top);

        if(selectedArtist.index >= 0 && selectedAlbum.index >= 0) {
            const artist = artists[selectedArtist.index];
            if(artist) {
                const album = artist.albums[selectedAlbum.index];
                if (album && album.songs) {
                    const indexes = Array.isArray(index) ? index : [index];
                    const validIndexs = indexes.filter(i => album.songs[i]);
                    addToPlaylist(selectedArtist.index, selectedAlbum.index, validIndexs, top);
                }
            }
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
    selectedAlbum: PropTypes.shape({
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

function mapStateToProps({albums, selectedAlbum, selectedArtist}) {
    return {
        artists: albums.artists,
        selectedAlbum,
        selectedArtist
    };
}

export default connect(mapStateToProps, { addToPlaylist })(AlbumView);

