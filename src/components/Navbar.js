import React, { Component } from 'react';
import { Link } from 'react-router';
import ArtistSearch from '../containers/ArtistSearch';


class Navbar extends Component {

    render() {
        return(
            <div role="navigation" className="navbar navbar-default" >
                <div className="container-fluid">
                    <div className="navbar-header">
                        <Link to="/" className="navbar-brand">Poor Man&rsquo;s Tunes</Link>
                    </div>
                    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                        <form className="navbar-form navbar-right" role="search" onSubmit={(e)=>e.preventDefault()}>
                            <ArtistSearch/>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}


export default Navbar;
