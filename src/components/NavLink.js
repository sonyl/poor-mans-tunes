import React from 'react';
import { Link } from 'react-router';

export default ({activate=true, ...props}) => {
    const activeClassName = activate ? 'active' : '';
    return <Link {...props} activeClassName={activeClassName} className="nav-link"/>;
};