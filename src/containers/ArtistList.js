/* @flow */
import React, {Component } from 'react';
import { connect } from 'react-redux';

import NavLink from '../components/NavLink';
import { createLinkUrl, createLog } from '../utils';
import { getArtists, getSelectedArtist } from '../reducers';

import type { Collection, Artist } from '../types';
//import type { MapStateToProps } from 'react-redux';


const CATEGORIES = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','Y','Z', '0..9'];
const IGNORE = ['The ', 'the ', 'Die ', 'die '];
const MAP = {'Ä': 'A', 'Ö': 'O', 'Ü': 'U'};

const ENABLE_LOG = false;
const log = createLog(ENABLE_LOG, 'ArtistList');


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
    const index = categories.findIndex(c => c.category === category);
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

function TabContent({id, active, children}: {id: string, active: boolean, children: Object}) {
    const className = 'tab-pane' + (active ? ' active': '');
    return (
        <div role="tabpanel" className={className} id={id}>{children}</div>
    );
}

type Props = {
    artists: Collection,
    selectedArtist: Artist
}
type State = {
    categories: Object[],
    activeIndex: number
}

class ArtistList extends Component<Props, State> {

    state: State;

    onTabChange: (number)=> void;

    constructor(props: Props) {
        super(props);
        const categories = categorize(props.artists);
        this.state = {
            categories,
            activeIndex: getActiveIndex(categories, props.selectedArtist.artist)
        };

        this.onTabChange = this.onTabChange.bind(this);
    }

    componentWillReceiveProps(nextProps: Props) {
        log('componentWillReceiveProps()', ' this.props = %o, nextProps = %o', this.props, nextProps);
        if(nextProps.artists !== this.props.artists
            || nextProps.selectedArtist !== this.props.selectedArtist) {

            const categories = categorize(nextProps.artists);
            this.setState( {
                categories,
                activeIndex: getActiveIndex(categories, nextProps.selectedArtist.artist)
            });
        }
    }

    renderArtistNames(category) {
        return category.map(c => {
            const artist = c.artist.artist;
            return (
                <div key={artist}>
                    <NavLink to={createLinkUrl(artist)}>{artist}</NavLink>
                </div>
            );
        });
    }

    renderTabs() {
        const {activeIndex, categories} = this.state;
        return categories.map((c, i) => {
            return (
                <Tab key={c.category} index={i} active={activeIndex === i} onTabChange={this.onTabChange}>
                    {c.category}&nbsp;
                </Tab>
            );

        });
    }

    renderTabsContent() {
        const {activeIndex, categories} = this.state;
        return categories.map((c, i) => {
            return <TabContent id={'tab-' + i} key={c.category} active={activeIndex === i}>{this.renderArtistNames(c.artists)}</TabContent>;
        });
    }

    onTabChange(index) {
        this.setState({
            activeIndex: index
        });
    }

    render() {
        log('render', 'selectedArtist=%o', this.props.selectedArtist);
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
}

const mapStateToProps = (state) => ({
    artists: getArtists(state),
    selectedArtist: getSelectedArtist(state)
});

const dummyDispatchToMakeFlowHappy = (dispatch: Dispatch) => ({
    dispatch: dispatch
});

export default connect(mapStateToProps, dummyDispatchToMakeFlowHappy )(ArtistList);
