import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router-dom';
import ArtistSearch from '../containers/ArtistSearch';

class Navbar extends Component {

    onClick() {
        if (this.props.setRandom) {
            this.props.setRandom(!this.props.randomActive);
        }
    }

    render() {
        return (
            <div role="navigation" className="navbar navbar-default">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <Link to="/" className="navbar-brand">Poor Man&rsquo;s Tunes</Link>
                    </div>
                    <div className="container">
                        <span>
                            <input type="checkbox" disabled={true} checked={this.props.randomActive}
                            />
                            &nbsp;
                            <button type="button"
                                    className={'btn btn-default navbar-btn' + (this.props.randomActive ? ' active' : '')}
                                    style={{maxWidth: '200px'}}
                                    onClick={this.onClick.bind(this)}

                            >
                                Play random songs
                            </button>
                        </span>
                        <form className="navbar-form navbar-right" role="search" onSubmit={(e) => e.preventDefault()}>
                            <ArtistSearch/>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    static propTypes = {
        randomActive: PropTypes.bool,
        setRandom: PropTypes.func
    };

    /* to prevent annoying warnings, make sure that the checkbox property 'checked' is never undefined */
    static defaultProps = {
        randomActive: false
    };
}


export default Navbar;
