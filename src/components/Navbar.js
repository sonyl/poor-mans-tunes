/* @flow */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import GlyphIcon from './GlyphIcon';
import ArtistSearch from '../containers/ArtistSearch';

function OkIcon(props) {
    return <GlyphIcon iconName={props.checked ? 'ok' : 'remove' }/>;
}

function CdIcon() {
    return <GlyphIcon iconName='cd' style={{top: '5px'}}/>;
}

type Props = {
    randomSongActive: boolean,
    randomAlbumActive: boolean,
    setRandomSong: (boolean)=>void,
    setRandomAlbum: (boolean)=>void
};

type DefaultProps = {
    randomSongActive: false,
    randomAlbumActive: false
};

type State = void;

class Navbar extends Component<DefaultProps, Props, State> {

    onClick = (evt: Event) => {
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
                        <Link to="/" className="navbar-brand" style={{fontSize: '30px', padding: '5px'}}>
                            <CdIcon/>
                            <span style={{marginLeft: '10px'}}>Poor Man&rsquo;s Tunes</span>
                        </Link>
                    </div>
                    <div className="form-group">
                        <form className="navbar-form navbar-right" role="search" onSubmit={(e) => e.preventDefault()}
                        style={{marginTop: '20px'}}>
                            <ArtistSearch/>
                        </form>
                        <form className="navbar-form navbar-right">
                            <button type="button"
                                id="selectRandomAlbum"
                                className={'navbar-right btn btn-default navbar-btn' + (this.props.randomAlbumActive ? ' active' : '')}
                                onClick={this.onClick}
                            >
                                <OkIcon checked={this.props.randomAlbumActive}/>
                                Album
                            </button>
                            <button type="button"
                                id="selectRandomSong"
                                className={'navbar-right btn btn-default navbar-btn' + (this.props.randomSongActive ? ' active' : '')}
                                onClick={this.onClick}
                            >
                                <OkIcon checked={this.props.randomSongActive}/>
                                Song
                            </button>
                            <label htmlFor="selectRandomSong" className="navbar-text navbar-right" style={{marginRight: '5px'}}>
                                If playlist is empty, play random:
                            </label>
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
