/* @flow */

import React from 'react';
import { NavLink } from 'react-router-dom'; // NavLink was introduced in react-router(-dom) v4

export default ({activate=true, ...props}: {activate?: boolean, to: string}) => {
    const activeClassName = activate ? 'active' : '';
    return <NavLink {...props}  activeClassName={activeClassName} className="nav-link"/>;
};