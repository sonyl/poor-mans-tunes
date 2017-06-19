/* @flow */
/* eslint-env node, jest */
import React from 'react';
import { Provider } from 'react-redux';
import { shallow, mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import ConnectedPlaylistView, {PlaylistView} from './PlaylistView';

const mockStore = configureMockStore();

function setup(playlist = []) {

    const props = {
        removeSongAtIndexFromPlaylist: () => {},
        moveSongToPositionInPlaylist: () => {},
        clearPlaylist: () => {},
        playlist
    };

    const enzymeWrapper = shallow(<PlaylistView {...props} />);

    return {
        props,
        enzymeWrapper
    };
}

function connectedSetup(playlist = []) {

    const props = {
        removeSongAtIndexFromPlaylist: () => {},
        moveSongToPositionInPlaylist: () => {},
        clearPlaylist: () => {}
    };

    const enzymeWrapper = mount(
        <Provider store={mockStore({playlist})}>
            <ConnectedPlaylistView/>
        </Provider>
    );

    return {
        props,
        enzymeWrapper
    };
}

describe('PlaylistView', () => {

    it('should render self', () => {
        const { enzymeWrapper } = setup();
        expect(enzymeWrapper.closest('div').hasClass('panel')).toBe(true);
        expect(enzymeWrapper.closest('div').hasClass('panel-default')).toBe(true);
    });

    it('should render playlist', () => {
        const { enzymeWrapper } = setup([
            { artist: 'Artist1', album: 'Album1', song: 'Song1', url: 'a url 1' },
            { artist: 'Artist2', album: 'Album2', song: 'Song2', url: ['a url 2', 'a url 3'] }
        ]);
        expect(enzymeWrapper.find('Entry')).toHaveLength(2);
        expect(enzymeWrapper.find('Entry').at(0).prop('artist')).toEqual('Artist1');
        expect(enzymeWrapper.find('Entry').at(1).prop('album')).toEqual('Album2');
    });
});

describe('ConnectedPlaylistView', () => {
    it('should render playlist', () => {
        const { enzymeWrapper } = connectedSetup([
            { artist: 'Artist1', album: 'Album1', song: 'Song1', url: 'a url 1' },
            { artist: 'Artist2', album: 'Album2', song: 'Song2', url: 'a url 2' }
        ]);
        expect(enzymeWrapper.find('Entry')).toHaveLength(2);
        expect(enzymeWrapper.find('Entry').at(0).prop('artist')).toEqual('Artist1');
        expect(enzymeWrapper.find('Entry').at(1).prop('album')).toEqual('Album2');
    });
});

