/* global process:false */

import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';

import reducer from './reducers';
import Main from './containers/Main';

import 'grommet/scss/vanilla/index';

const middleware = [ thunk ];
if (process.env.NODE_ENV !== 'production') {
    middleware.push(createLogger());
}

const store = createStore(
    reducer,
    applyMiddleware(...middleware)
);


console.log('Store:', store);
render(
    <Provider store={store}>
        <Main />
    </Provider>, document.getElementById('app')
);
