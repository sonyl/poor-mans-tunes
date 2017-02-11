import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';

import { getCollection } from '../actions/collectionActions';
import { selectArtist, unselectArtist, selectAlbum, unselectAlbum } from '../actions/selectionActions';
import { setPlayRandom } from '../actions/settingsActions';

import PlaylistView from './PlaylistView';
import Navbar from '../components/Navbar';
import ArtistList from './ArtistList';
import ArtistView from './ArtistView';
import AlbumView from './AlbumView';
import Player from './Player';
import Footer from '../components/Footer';
import { createLog } from '../components/utils';

const ENABLE_LOG = false;
const log = createLog(ENABLE_LOG, 'Main');

function getArtistIndex(artists, artist) {
    return artists.findIndex(a => a.artist === artist);
}

function getAlbumIndex(albums, album) {
    return albums.findIndex(a => a.album === album);
}

function parseUrl(path = '') {

    let artist, album;
    const parts = decodeURIComponent(path).split('/');
    if(parts.length < 5) {
        // we assume /app/artist/name
        // '' = parts[0];
        // 'app' = parts[1];
        artist = parts[2] || null;
        album = parts[3] || null;
    }

    return {
        artist,
        album
    };
}

function getAlbumAndSongCnt(artists) {
    const result = {
        albumCnt: 0,
        songCnt: 0
    };

    artists.forEach(artist => {
        artist.albums.forEach(album => {
            result.albumCnt++;
            result.songCnt += album.songs.length;
        });
    });

    return result;
}


class Main extends Component {

    componentDidMount() {
        this.props.getCollection();
    }

    /* new route selected */
    componentWillReceiveProps(nextProps) {
        // const {artists, selectedArtist, selectedAlbum, location} = nextProps;
        // const params = parseUrl(location.pathname);
        const {params, artists, selectedArtist, selectedAlbum} = nextProps;
        log('componentWillReceiveProps', 'nextProps:', nextProps, params);

        if(params.artist !== selectedArtist.name) {
            if(params.artist) {
                const index = getArtistIndex(artists, params.artist);
                if (index >= 0) {
                    this.props.selectArtist(index, artists[index].artist);
                }
            } else if(this.props.selectedArtist.name) {
                this.props.unselectArtist();
            }

        }
        if(params.album !== selectedAlbum.name ) {
            if(params.album) {
                if(selectedArtist.index >=0) {
                    const artist = artists[selectedArtist.index];
                    const index = getAlbumIndex(artist.albums, params.album);
                    if (index >= 0) {
                        this.props.selectAlbum(index, artist.albums[index]);
                    }
                }
            } else if(this.props.selectedAlbum.name){
                this.props.unselectAlbum();
            }
        }
    }

    setRandom = newState => {
        log('setRandom', 'newState=', newState);
        this.props.setPlayRandom(!!newState);
    };

    render() {
        log('render', 'props=', this.props);

        const {artists, settings} = this.props;

        const {albumCnt, songCnt} = getAlbumAndSongCnt(artists);

        return (
            <div className="container-fluid">
                <Navbar randomActive={settings.playRandom} setRandom={this.setRandom}/>
                <div className="row">
                    <div className="col-md-4">
                        <ArtistView />
                    </div>
                    <div className="col-md-4">
                        <AlbumView  />
                    </div>
                    <div className="col-md-4">
                        <Player />
                        <PlaylistView />
                    </div>
                </div>
                <ArtistList />
                <Footer
                    message="Poor Man&rsquo;s Tunes xxxx: &copy; 2017"
                    artistCnt={artists.length}
                    albumCnt={albumCnt}
                    songCnt={songCnt} />
            </div>
        );
    }

    static propTypes = {
        artists: PropTypes.arrayOf(PropTypes.object).isRequired,
        selectedArtist: PropTypes.object.isRequired,
        selectedAlbum: PropTypes.object.isRequired,
        settings: PropTypes.object.isRequired,
        playlist: PropTypes.arrayOf(PropTypes.object).isRequired,

        getCollection: PropTypes.func.isRequired,
        selectArtist: PropTypes.func.isRequired,
        unselectArtist: PropTypes.func.isRequired,
        selectAlbum: PropTypes.func.isRequired,
        unselectAlbum: PropTypes.func.isRequired,
        setPlayRandom: PropTypes.func.isRequired
    }
}

const mapStateToProps = state => {
    const { collection, selection, playlist, settings } = state;
    const props =  {
        artists: collection.artists,
        selectedArtist: selection.artist,
        selectedAlbum: selection.album,
        settings,
        playlist
    };

    return props;
};

const mapDispatchToProps = () => {
    return {
        getCollection,
        selectArtist,
        unselectArtist,
        selectAlbum,
        unselectAlbum,
        setPlayRandom
    };
};

export default connect(mapStateToProps, mapDispatchToProps())(Main);
