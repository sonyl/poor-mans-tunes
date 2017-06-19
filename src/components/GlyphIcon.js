/* @flow */

import React from 'react';
import PropTypes from 'prop-types';


const GlyphIcon = ({iconName, ...props}: {iconName: string}) => (
    <span className={`glyphicon glyphicon-${iconName}`} {...props}/>
);

GlyphIcon.propTypes = {
    iconName: PropTypes.string.isRequired
};

export default GlyphIcon;
