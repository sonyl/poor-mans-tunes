import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getCollection } from '../actions/collectionActions';
import { requestServerSettings } from '../actions/serverActions';
import { selectArtist, unselectArtist, selectAlbum, unselectAlbum } from '../actions/selectionActions';
import { setPlayRandomSong, setPlayRandomAlbum } from '../actions/settingsActions';
import { getArtists, getSelectedArtist, getSelectedAlbum, isSetInSettings } from '../reducers';

import PlaylistView from './PlaylistView';
import Navbar from '../components/Navbar';
import ArtistList from './ArtistList';
import ArtistView from './ArtistView';
import AlbumView from './AlbumView';
import Player from './Player';
import Footer from '../components/Footer';
import Settings from './Settings';
import { createLog } from '../components/utils';

const ENABLE_LOG = false;
const log = createLog(ENABLE_LOG, 'Main');

function getArtistIndex(artists, artist) {
    return artists.findIndex(a => a.artist === artist);
}

function getAlbumIndex(albums, album) {
    return albums.findIndex(a => {
        let title = a.album;
        while(title.endsWith('?')) {    // e.g. (What's the Story) Morning Glory? ends with ? which is not part of route
            title = title.slice(0, -1);
        }
        return title === album;
    });
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

    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'playing'
        };
    }

    componentDidMount() {
        this.props.getCollection();
        this.props.requestServerSettings();
    }

    /* new route selected */
    componentWillReceiveProps(nextProps) {
        // const {artists, selectedArtist, selectedAlbum, location} = nextProps;
        // const params = parseUrl(location.pathname);
        const {params, artists, selectedArtist, selectedAlbum} = nextProps;
        log('componentWillReceiveProps', 'nextProps:', nextProps, params);

        if(params.artist !== selectedArtist.artist) {
            if(params.artist) {
                const index = getArtistIndex(artists, params.artist);
                if (index >= 0) {
                    this.props.selectArtist(index, artists[index].artist);
                    this.setState({
                        activeTab: 'playing'
                    });
                }
            } else if(this.props.selectedArtist.artist) {
                this.props.unselectArtist();
            }

        }
        if(params.album !== selectedAlbum.album ) {
            if(params.album) {
                if(selectedArtist.artist) {

                    const index = getAlbumIndex(selectedArtist.albums, params.album);
                    if (index >= 0) {
                        this.props.selectAlbum(index, selectedArtist.albums[index]);
                    }
                }
            } else if(this.props.selectedAlbum.album){
                this.props.unselectAlbum();
            }
        }
    }

    setRandomSong = newState => {
        log('setRandomSong', 'newState=', newState);
        this.props.setPlayRandomSong(!!newState);
    };

    setRandomAlbum = newState => {
        log('setRandomAlbum', 'newState=', newState);
        this.props.setPlayRandomAlbum(!!newState);
    };

    tabChanged = event => {
        event.preventDefault();
        const newTab = event.target.hash.substr(1);
        if(newTab !== this.state.activeTab) {
            this.setState({activeTab: newTab});
        }
    };

    render() {
        log('render', 'props=', this.props);

        const {artists, isPlayRandomSong, isPlayRandomAlbum} = this.props;
        const {activeTab} = this.state;

        const {albumCnt, songCnt} = getAlbumAndSongCnt(artists);

        return (
            <div className="container-fluid">
                <Navbar randomSongActive={isPlayRandomSong} setRandomSong={this.setRandomSong}
                        randomAlbumActive={isPlayRandomAlbum} setRandomAlbum={this.setRandomAlbum}
                />
                <div>
                    <ul className="nav nav-tabs" role="tablist">
                        <li role="presentation" className={activeTab ==='playing' ? 'active' : ''}>
                            <a href="#playing" role="tab" onClick={this.tabChanged}>Currently Playing</a></li>
                        <li role="presentation" className={activeTab ==='collection' ? 'active' : ''}>
                            <a href="#collection" role="tab" onClick={this.tabChanged}>Collection</a></li>
                        <li role="presentation" className={activeTab ==='settings' ? 'active' : ''}>
                            <a href="#settings" role="tab" onClick={this.tabChanged}>Settings</a></li>
                    </ul>
                </div>
                <div className="tab-content">
                    <div role="tabpanel" className={'tab-pane' +  (activeTab === 'playing' ? ' active' : '')}>
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
                    </div>
                    <div role="tabpanel" className={'tab-pane' +  (activeTab === 'collection' ? ' active' : '')}>
                        <ArtistList />
                    </div>
                    <div role="tabpanel" className={'tab-pane' +  (activeTab === 'settings' ? ' active' : '')}>
                        <Settings />
                    </div>
                </div>

                <Footer
                    message="Poor Man&rsquo;s Tunes: &copy; 2017"
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
        isPlayRandomSong: PropTypes.bool.isRequired,
        isPlayRandomAlbum: PropTypes.bool.isRequired,
        playlist: PropTypes.arrayOf(PropTypes.object).isRequired,

        getCollection: PropTypes.func.isRequired,
        requestServerSettings: PropTypes.func.isRequired,
        selectArtist: PropTypes.func.isRequired,
        unselectArtist: PropTypes.func.isRequired,
        selectAlbum: PropTypes.func.isRequired,
        unselectAlbum: PropTypes.func.isRequired,
        setPlayRandomSong: PropTypes.func.isRequired,
        setPlayRandomAlbum: PropTypes.func.isRequired
    }
}

const mapStateToProps = state => ({
    artists: getArtists(state),
    selectedArtist: getSelectedArtist(state),
    selectedAlbum: getSelectedAlbum(state),
    isPlayRandomSong: isSetInSettings(state, 'playRandomSong'),
    isPlayRandomAlbum: isSetInSettings(state, 'playRandomAlbum'),
    playlist: state.playlist
});

const mapDispatchToProps = {
    getCollection,
    requestServerSettings,
    selectArtist,
    unselectArtist,
    selectAlbum,
    unselectAlbum,
    setPlayRandomSong,
    setPlayRandomAlbum
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
