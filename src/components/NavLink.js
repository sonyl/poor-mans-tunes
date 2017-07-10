/* @flow */

import React from 'react';
import { NavLink } from 'react-router-dom'; // NavLink was introduced in react-router(-dom) v4

type Props = { activate?: boolean, to: string, props?: mixed[]}

export default ({activate=true, ...props}: Props) => {
    const activeClassName = activate ? 'active' : '';
    return <NavLink {...props}  activeClassName={activeClassName} className="nav-link"/>;
};