/* eslint-env node, jest */
import React from 'react';
import { shallow } from 'enzyme';
import NavLink from './NavLink';

function setup(props = {}) {

    const enzymeWrapper = shallow(<NavLink {...props} />);

    return {
        props,
        enzymeWrapper
    };
}

describe('NavLink', () => {

    it('should render self', () => {
        const { enzymeWrapper } = setup();
        expect(enzymeWrapper.find('Link').hasClass('nav-link')).toBe(true);
        expect(enzymeWrapper.find('Link').prop('activeClassName')).toBe('active');
    });

    it('should be able to deactivate activeClassName feature', () => {
        const { enzymeWrapper } = setup({activate: false});
        expect(enzymeWrapper.find('Link').hasClass('nav-link')).toBe(true);
        expect(enzymeWrapper.find('Link').prop('activeClassName')).toBe('');
    });

    it('should render self and 	pass-through props', () => {
        const { enzymeWrapper } = setup({style:{backgroundColor: 'black'}});
        expect(enzymeWrapper.find('Link').hasClass('nav-link')).toBe(true);
        expect(enzymeWrapper.find('Link').prop('style')).toEqual({backgroundColor: 'black'});
    });

});
