import React from 'react';
import { Link } from 'react-router';

export default ({activate=true, ...props}) => {
    const activeClassName = activate ? 'active' : '';  // not used in latest v4 relase, TODO: find v4 solution
    return <Link {...props}  activeClassName={activeClassName} className="nav-link"/>;
};