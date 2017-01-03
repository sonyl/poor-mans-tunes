import React, {Component} from 'react';
import { connect } from 'react-redux';
import { fetchAllAlbums, selectNewArtist, selectNewAlbum} from '../actions';
import { addToPlaylist, removeFromPlaylist } from '../actions/playlistActions';
import _ from 'lodash';

import App from 'grommet/components/App';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Box from 'grommet/components/Box';
import Columns from 'grommet/components/Columns';

import ArtistList from 'components/ArtistList';
import ArtistView from 'components/ArtistView';
import AlbumView from 'components/AlbumView';
import PlaylistView from 'components/PlaylistView';
import Player from 'components/Player';
import ArtistSearch from 'components/ArtistSearch';


const baseUrl = 'http://www';

function createMp3Url(part) {
    if(part) {
        return baseUrl + part;
    }
    return null;
}

function getArtistIndex(artists, artist) {
    return _.findIndex(artists, {artist});
}

function getAlbumIndex(albums, album) {
    return _.findIndex(albums, {album});
}


class Main extends Component {

    constructor(props) {
        super(props);

        this.addEntryToPlaylist = this.addEntryToPlaylist.bind(this);
        this.removeEntryFromPlaylist = this.removeEntryFromPlaylist.bind(this);
        this.fastForward = this.fastForward.bind(this);
    }

    componentDidMount() {
        const {dispatch} = this.props;
        dispatch(fetchAllAlbums());
    }

    componentWillReceiveProps(nextProps) {
        const {params, artists, currentArtist, currentAlbum, dispatch} = nextProps;
        console.log('Main.componentWillReceiveProps() nextProps:', nextProps, params, artists, params.artist);
        if(params.artist && params.artist != currentArtist.name ) {
            const index = getArtistIndex(artists, params.artist);
            if(index >= 0) {
                dispatch(selectNewArtist(index, artists[index].artist));
            }
        }
        if(currentArtist.index && params.album && params.album != currentAlbum.name ) {
            const artist = artists[currentArtist.index];
            const index = getAlbumIndex(artist.albums, params.album);
            if(index >= 0) {
                dispatch(selectNewAlbum(index, artist.albums[index]));
            }
        }
    }


    render() {
        console.log('Main.render() props=', this.props);
        const {artists, currentArtist, currentAlbum, currentSong, playlist} = this.props;

        return (
            <App centered={false}>
                <Header direction="row" justify="between" pad={{horizontal: 'medium'}}>
                    <Title>Poor Man&rsquo;s Tunes</Title>
                    <ArtistSearch artists={artists} setArtist={this.setCurrentArtist}/>
                </Header>
                <Columns>
                    <ArtistView artist={ artists[currentArtist.index] || {} }
                                currentArtist={ currentArtist }
                    />
                    <AlbumView artist={currentArtist}
                                album={currentAlbum}
                                addToPlaylist={ this.addEntryToPlaylist }
                    />
                    <Box>
                        <Player
                            url={this.getCurrentUrl()}
                            fastForward={this.fastForward}
                        />
                        <PlaylistView playlist={playlist} artists={artists} removeEntry={this.removeEntryFromPlaylist}/>
                    </Box>
                </Columns>
                <ArtistList artists={artists}
                            currentArtist={currentArtist}
                            setArtist={this.setCurrentArtist}
                />

            </App>
        );
    }

    getCurrentUrl() {
        const { playlist, artists } = this.props;
        const currentSong = playlist[0];
        const artist = currentSong && artists[currentSong.artistIndex];
        const album = artist && artist.albums[currentSong.albumIndex];
        const song = album && album.songs[currentSong.songIndex];
        if (song) {
            return createMp3Url(song.mp3);
        }
        return null;
    }

    addEntryToPlaylist(index) {
        console.log('addEntryToPlaylist', index);

        const {artists, currentArtist, currentAlbum, dispatch} = this.props;
        if(currentArtist.index >= 0 && currentAlbum.index >= 0) {
            const artist = artists[currentArtist.index];
            if(artist) {
                const album = artist.albums[currentAlbum.index];

                if (album && album.songs && album.songs[index]) {
                    dispatch(addToPlaylist(currentArtist.index, currentAlbum.index, index));
                }
            }
        }
    }

    removeEntryFromPlaylist(index) {
        console.log('removeEntryFromPlaylist', index);
        const {dispatch} = this.props;
        dispatch(removeFromPlaylist(index));
    }

    fastForward() {
        this.removeEntryFromPlaylist(0);
    }
}

const mapStateToProps = state => {
    const { albums, currentArtist, currentAlbum, currentSong, playlist } = state;

    const props =  {
        artists: albums.artists,
        currentArtist,
        currentAlbum,
        playlist
    };

    console.log('mapStateToProps:', state, '=>', props);
    return props;
};

export default connect(mapStateToProps)(Main);
