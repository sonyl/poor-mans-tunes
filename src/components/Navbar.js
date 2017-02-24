import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import GlyphIcon from './GlyphIcon';
import ArtistSearch from '../containers/ArtistSearch';

function OkIcon(props) {
    return <GlyphIcon iconName={props.checked ? 'ok' : 'remove' }/>;
}

class Navbar extends Component {

    onClick = evt => {
        if(evt.target.id=='selectRandomSong') {
            if(this.props.randomAlbumActive && this.props.setRandomAlbum) {
                this.props.setRandomAlbum(false);
            }
            if(this.props.setRandomSong) {
                this.props.setRandomSong(!this.props.randomSongActive);
            }
        }
        if(evt.target.id=='selectRandomAlbum') {
            if(this.props.randomSongActive && this.props.setRandomSong) {
                this.props.setRandomSong(false);
            }
            if(this.props.setRandomAlbum) {
                this.props.setRandomAlbum(!this.props.randomAlbumActive);
            }
        }
    };

    render() {
        return (
            <div role="navigation" className="navbar navbar-default">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <Link to="/" className="navbar-brand">Poor Man&rsquo;s Tunes</Link>
                    </div>
                    <div className="container">
                        <button type="button"
                                id="selectRandomSong"
                                className={'btn btn-default navbar-btn' + (this.props.randomSongActive ? ' active' : '')}
                                style={{maxWidth: '200px'}}
                                onClick={this.onClick}
                        >
                            <OkIcon checked={this.props.randomSongActive}/> Play random song
                        </button>
                        &nbsp;
                        <button type="button"
                                id="selectRandomAlbum"
                                className={'btn btn-default navbar-btn' + (this.props.randomAlbumActive ? ' active' : '')}
                                style={{
                                    marginLeft: '10px',
                                    maxWidth: '200px'}}
                                onClick={this.onClick}

                        >
                            <OkIcon checked={this.props.randomAlbumActive}/> Play random album
                        </button>
                        <form className="navbar-form navbar-right" role="search" onSubmit={(e) => e.preventDefault()}>
                            <ArtistSearch/>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    static propTypes = {
        randomSongActive: PropTypes.bool,
        randomAlbumActive: PropTypes.bool,
        setRandomSong: PropTypes.func,
        setRandomAlbum: PropTypes.func
    };

    /* to prevent annoying warnings, make sure that the checkbox property 'checked' is never undefined */
    static defaultProps = {
        randomSongActive: false,
        randomAlbumActive: false
    };
}


export default Navbar;
