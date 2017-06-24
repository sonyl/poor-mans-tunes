/* @flow */
/* eslint-env node, jest */
import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import NavLink from './NavLink';

function setup(props = {to: 'http://dummy.com'}) {

    const enzymeWrapper = mount(
        <MemoryRouter location="/">
            <NavLink to="http://dummy.com" {...props} />
        </MemoryRouter>
    );

    return {
        props,
        enzymeWrapper
    };
}

describe('NavLink', () => {

    it('should render self', () => {
        const { enzymeWrapper } = setup();
        //console.log(enzymeWrapper.debug());
        expect(enzymeWrapper.find('NavLink').hasClass('nav-link')).toBe(true);
        expect(enzymeWrapper.find('NavLink').prop('activeClassName')).toBe('active');
    });

    it('should be able to deactivate activeClassName feature', () => {
        const { enzymeWrapper } = setup({activate: false});
        expect(enzymeWrapper.find('NavLink').hasClass('nav-link')).toBe(true);
        expect(enzymeWrapper.find('NavLink').prop('activeClassName')).toBe('');
    });

    it('should render self and 	pass-through props', () => {
        const { enzymeWrapper } = setup({style:{backgroundColor: 'black'}});
        expect(enzymeWrapper.find('NavLink').hasClass('nav-link')).toBe(true);
        expect(enzymeWrapper.find('NavLink').prop('style')).toEqual({backgroundColor: 'black'});
    });

});

