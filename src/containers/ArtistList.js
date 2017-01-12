import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import findIndex from 'lodash/findIndex';

import NavLink from '../components/NavLink';

const CATEGORIES = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','Y','Z', '0..9'];
const IGNORE = ['The ', 'the ', 'Die ', 'die '];
const MAP = {'Ä': 'A', 'Ö': 'O', 'Ü': 'U'};


function getCategory(name) {
    for(let i=0; i < IGNORE.length; i++) {
        if(name.startsWith(IGNORE[i])) {
            name = name.substr(IGNORE[i].length);
            break;
        }
    }
    let catgeory = name.substr(0, 1).toUpperCase();
    catgeory = MAP[catgeory] || catgeory;
    if(CATEGORIES.indexOf(catgeory) < 0) {
        catgeory = '0..9';
    }
    return catgeory;
}

function categorize(artists) {
    const catgegoryMap = {};
    artists.forEach((a, i) => {
        const catgeory = getCategory(a.artist);
        catgegoryMap[catgeory] = catgegoryMap[catgeory] || [];
        catgegoryMap[catgeory].push({artist: a, index: i});
    });
    const categories = [];
    CATEGORIES.forEach(c => {
        const artists = catgegoryMap[c];
        if(artists) {
            categories.push({category: c, artists});
        }
    });

    return categories;
}

function getActiveIndex(categories, name) {
    if(!name) {
        return 0;
    }

    const category = getCategory(name);
    const index = findIndex(categories, c => c.category === category);
    return index > 0 ? index : 0;
}

function Tab({index, active, onTabChange, children}) {

    const onClick = (e) => {
        e.preventDefault();
        if(onTabChange) { onTabChange(index); }
    };

    return (
        <li className={active ? 'active' : ''}>
            <a onClick={onClick}>{ children }</a>
        </li>
    );
}

function TabContent({id, active, children}) {
    const className = 'tab-pane' + (active ? ' active': '');
    return (
        <div role="tabpanel" className={className} id={id}>{children}</div>
    );
}

class ArtistList extends Component {

    constructor(props) {
        super(props);
        const categories = categorize(props.artists);
        this.state = {
            categories,
            activeIndex: getActiveIndex(categories, props.selectedArtist && props.selectedArtist.name)
        };

        this.onTabChange = this.onTabChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.artists !== this.props.artists
            || nextProps.selectedArtist !== this.props.selectedArtist) {

            const categories = categorize(nextProps.artists);
            this.setState( {
                categories,
                activeIndex: getActiveIndex(categories, nextProps.selectedArtist && nextProps.selectedArtist.name)
            });
        }
    }

    renderArtistNames(category) {
        return category.map(c => {
            const artist = c.artist.artist;
            return (
                <div key={artist}>
                    <NavLink to={`/${artist}`}> {artist} </NavLink>
                </div>
            );
        });
    }

    renderTabs() {
        const {activeIndex, categories} = this.state;
        return categories.map((c, i) => {
            return <Tab key={c.category} index={i} active={activeIndex === i} onTabChange={this.onTabChange}>{c.category}</Tab>;
        });
    }

    renderTabsContent() {
        const {activeIndex, categories} = this.state;
        return categories.map((c, i) => {
            return <TabContent key={c.category} active={activeIndex === i}>{this.renderArtistNames(c.artists)}</TabContent>;
        });
    }

    render() {
        return (
            <div>
                <h3>All artists:</h3>
                <nav>
                    <ul className="nav nav-tabs">
                        {this.renderTabs()}
                    </ul>
                    <div className="tab-content">
                        {this.renderTabsContent()}
                    </div>
                </nav>
            </div>
        );
    }

    onTabChange(index) {
        this.setState({
            activeIndex: index
        });
    }
}

ArtistList.propTypes = {
    artists: PropTypes.arrayOf(PropTypes.object),
    selectedArtist: PropTypes.object
};

function mapStateToProps({albums, selectedArtist}) {
    return {
        artists: albums.artists,
        selectedArtist
    };
}

export default connect(mapStateToProps)(ArtistList);
