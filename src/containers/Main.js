import React, {Component} from 'react';
import { connect } from 'react-redux';
import { fetchAllAlbums, selectNewArtist, selectNewAlbum, selectSong} from '../actions';

import App from 'grommet/components/App';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Box from 'grommet/components/Box';
import Columns from 'grommet/components/Columns';

import ArtistList from 'components/ArtistList';
import ArtistView from 'components/ArtistView';
import LastFmView from 'components/LastFmView';
import AlbumView from 'components/AlbumView';
import Player from 'components/Player';
import ArtistSearch from 'components/ArtistSearch';


const baseUrl = 'http://www';

export function createMp3Url(part) {
    if(part) {
        return baseUrl + part;
    }
    return null;
}


class Main extends Component {

    constructor(props) {
        super(props);

        this.setCurrentArtist = this.setCurrentArtist.bind(this);
        this.setCurrentAlbum = this.setCurrentAlbum.bind(this);
        this.setCurrentSong = this.setCurrentSong.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(fetchAllAlbums());
    }

    render() {
        const {artists, currentArtist, currentAlbum, currentSong} = this.props;

        return (
            <App centered={false}>
                <Header direction="row" justify="between" pad={{horizontal: 'medium'}}>
                    <Title>Poor Man&rsquo;s Tunes</Title>
                    <ArtistSearch artists={artists} setArtist={this.setCurrentArtist}/>
                </Header>
                <Columns>
                    <ArtistView artist={ artists[currentArtist.index] || {} }
                                currentArtist={ currentArtist }
                                currentAlbum={ currentAlbum }
                                setAlbum={ this.setCurrentAlbum }
                    />
                    <LastFmView artist={currentArtist}
                                album={currentAlbum.lastFmInfo}
                    />
                    <Box>
                        <AlbumView
                                   album={ currentAlbum }
                                   currentSong={ currentSong }
                                   setSong={ this.setCurrentSong }
                        />
                        <Player url={createMp3Url(currentSong && currentSong.song && currentSong.song.mp3)}/>
                    </Box>
                </Columns>
                <ArtistList artists={artists}
                            currentArtist={currentArtist}
                            setArtist={this.setCurrentArtist}
                />

            </App>
        );
    }

    setCurrentArtist(index) {
        const {artists, currentArtist, dispatch} = this.props;
        console.log('setCurrentArtist', index);

        if(artists[index] && currentArtist.index !== index) {
            dispatch(selectNewArtist(index, artists[index].artist));
        }
    }

    setCurrentAlbum(index) {
        const {artists, currentArtist, dispatch} = this.props;

        console.log('setCurrentAlbum', index);

        if(currentArtist.index >= 0) {
            const artist = artists[currentArtist.index];

            if(artist.albums[index]) {
                dispatch(selectNewAlbum(index, artist.albums[index].album, artist.albums[index]));
            }
        }
    }

    setCurrentSong(index) {
        console.log('setCurrentSong', index);

        const {artists, currentArtist, currentAlbum, dispatch} = this.props;
        if(currentArtist.index >= 0 && currentAlbum.index >= 0) {
            const artist = artists[currentArtist.index];
            if(artist) {
                const album = artist.albums[currentAlbum.index];

                if (album && album.songs && album.songs[index]) {
                    dispatch(selectSong(index, album.songs[index].title, album.songs[index]));
                }
            }
        }
    }
}

const mapStateToProps = state => {
    const { albums, currentArtist, currentAlbum, currentSong } = state;

    const props =  {
        artists: albums.artists,
        currentArtist,
        currentAlbum,
        currentSong
    };

    console.log('mapStateToProps:', state, '=>', props);
    return props;
};

export default connect(mapStateToProps)(Main);
